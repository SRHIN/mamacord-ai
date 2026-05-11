"""
Mamacord AI — WHO Guidelines Ingestion Pipeline

Reads PDF files from ./data/, extracts text, chunks by section,
embeds via OpenAI text-embedding-3-small, and stores in ChromaDB.
"""

import chromadb
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
import uuid

import pymupdf  # PyMuPDF (imported as pymupdf in recent versions)

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma_client = chromadb.PersistentClient(path="./chroma_db")

COLLECTION_NAME = "mamacord_who_guidelines"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CHUNK_SIZE = 800       # target characters per chunk
CHUNK_OVERLAP = 150    # overlap between chunks


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    """Extract text from each page of a PDF, returning list of {page, text}."""
    doc = pymupdf.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append({"page": i + 1, "text": text.strip()})
    doc.close()
    return pages


def chunk_pages(pages: list[dict], source_filename: str) -> list[dict]:
    """Split page text into overlapping chunks with metadata."""
    chunks = []
    for page_info in pages:
        page_num = page_info["page"]
        text = page_info["text"]

        # Try to detect section headings (lines that are ALL CAPS or start with a number pattern)
        current_section = ""
        section_match = re.search(
            r"^(\d+\.[\d.]*\s+[A-Z][^\n]{5,80})", text, re.MULTILINE
        )
        if section_match:
            current_section = section_match.group(1).strip()

        # Chunk by character length with overlap
        start = 0
        while start < len(text):
            end = start + CHUNK_SIZE
            chunk_text = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk_text.rfind(". ")
                if last_period > CHUNK_SIZE * 0.4:
                    end = start + last_period + 1
                    chunk_text = text[start:end]

            chunk_text = chunk_text.strip()
            if len(chunk_text) > 50:  # skip tiny fragments
                chunks.append({
                    "text": chunk_text,
                    "source": source_filename,
                    "section": current_section or f"Page {page_num}",
                    "page": str(page_num),
                })
            start = end - CHUNK_OVERLAP

    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts. Handles OpenAI's batch limits."""
    all_embeddings = []
    batch_size = 100  # OpenAI allows up to 2048 but 100 is safe
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.embeddings.create(
            input=batch,
            model="text-embedding-3-small",
        )
        all_embeddings.extend([item.embedding for item in response.data])
    return all_embeddings


def ingest():
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # Collect all PDF files from data directory
    if not os.path.isdir(DATA_DIR):
        print(f"No data directory found at {DATA_DIR}. Create it and add WHO PDF files.")
        return

    pdf_files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF files found in {DATA_DIR}.")
        return

    all_chunks = []
    for pdf_file in pdf_files:
        pdf_path = os.path.join(DATA_DIR, pdf_file)
        print(f"Extracting text from: {pdf_file}")
        pages = extract_text_from_pdf(pdf_path)
        print(f"  {len(pages)} pages extracted")
        chunks = chunk_pages(pages, pdf_file)
        print(f"  {len(chunks)} chunks created")
        all_chunks.extend(chunks)

    if not all_chunks:
        print("No chunks extracted from any PDF. Check the files in data/.")
        return

    # Clear existing collection to allow re-ingestion
    existing = collection.count()
    if existing > 0:
        print(f"Clearing {existing} existing chunks from collection...")
        # Delete all existing documents
        all_ids = collection.get()["ids"]
        if all_ids:
            collection.delete(ids=all_ids)

    texts = [c["text"] for c in all_chunks]
    print(f"Embedding {len(texts)} chunks (this may take a moment)...")
    embeddings = embed_texts(texts)

    ids = [str(uuid.uuid4()) for _ in all_chunks]
    metadatas = [
        {"source": c["source"], "section": c["section"], "page": c["page"]}
        for c in all_chunks
    ]

    # ChromaDB add in batches (max ~5000 per call)
    batch = 500
    for i in range(0, len(ids), batch):
        collection.add(
            ids=ids[i : i + batch],
            documents=texts[i : i + batch],
            embeddings=embeddings[i : i + batch],
            metadatas=metadatas[i : i + batch],
        )

    print(f"\nDone! {len(all_chunks)} chunks ingested into ChromaDB collection '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    ingest()
