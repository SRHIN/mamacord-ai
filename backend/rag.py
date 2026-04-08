import chromadb
from rank_bm25 import BM25Okapi
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma_client = chromadb.PersistentClient(path="./chroma_db")

BM25_KEYWORDS = ["pre-eclampsia", "haemorrhage", "sepsis", "proteinuria", "eclampsia",
                 "hypertension", "bleeding", "fever", "anaemia", "haemoglobin"]

COLLECTION_NAME = "mamacord_who_guidelines"


def get_collection():
    return chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def embed_query(text: str) -> list[float]:
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding


def build_query_string(data) -> str:
    hb_equiv = round(data.pcv / 3, 1)
    parts = [
        f"patient age {data.age} gestational age {data.gestational_age} weeks",
        f"blood pressure {data.systolic_bp}/{data.diastolic_bp} mmHg",
        f"temperature {data.temperature}°C heart rate {data.heart_rate} bpm",
        f"PCV {data.pcv}% estimated haemoglobin {hb_equiv} g/dL urine protein {data.urine_protein}",
    ]
    if data.placental_location:
        parts.append(f"placental location {data.placental_location}")
    if data.fetal_presentation:
        parts.append(f"fetal presentation {data.fetal_presentation}")
    return " ".join(parts)


def retrieve_context(data) -> str:
    collection = get_collection()
    count = collection.count()
    if count == 0:
        return "No knowledge base available. Run ingest.py to seed the WHO guidelines."

    query_text = build_query_string(data)
    query_embedding = embed_query(query_text)

    n_results = min(20, count)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas"]
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    # BM25 re-ranking
    tokenized_docs = [doc.lower().split() for doc in documents]
    bm25 = BM25Okapi(tokenized_docs)
    bm25_query = BM25_KEYWORDS + query_text.lower().split()
    scores = bm25.get_scores(bm25_query)

    top_indices = np.argsort(scores)[::-1][:5]

    context_chunks = []
    for idx in top_indices:
        meta = metadatas[idx]
        source = meta.get("source", "WHO Guidelines")
        section = meta.get("section", "")
        chunk = f"[{source} — {section}]\n{documents[idx]}"
        context_chunks.append(chunk)

    return "\n\n---\n\n".join(context_chunks)
