# Mamacord AI — Maternal Triage MVP

An AI-powered maternal triage tool for frontline health workers (TBAs, CHWs, PHC nurses) in low-resource Nigerian settings. Classifies maternal risk as GREEN / YELLOW / RED using a RAG pipeline grounded in WHO Maternal Health Guidelines.

---

## Setup

### 1. Backend

```bash
cd mamacord-ai/backend
pip install fastapi uvicorn openai chromadb python-dotenv rank-bm25 numpy pydantic httpx
```

Ensure `.env` contains your OpenAI API key:

```
OPENAI_API_KEY=your-key-here
```

Seed the local WHO knowledge base:

```bash
python ingest.py
```

Start the Mamacord AI backend:

```bash
uvicorn main:app --reload
```

### 2. Frontend

```bash
cd mamacord-ai/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture

- **RAG Pipeline:** Semantic search via ChromaDB (cosine similarity) + BM25 re-ranking (top 20 → top 5)
- **LLM:** GPT-4o-mini with strict JSON response format
- **Safety Overrides:** Python threshold checks enforce RED/YELLOW before the LLM response is returned
- **Handover Notes:** Auto-generated for all RED cases

## Risk Thresholds

| Parameter | YELLOW | RED |
|-----------|--------|-----|
| Systolic BP | 140–159 mmHg | ≥ 160 mmHg |
| Diastolic BP | 90–109 mmHg | ≥ 110 mmHg |
| Temperature | 37.5–38.0°C | > 38.0°C |
| Maternal HR | 90–100 bpm | > 100 bpm |
| Haemoglobin | 7–9 g/dL | < 7 g/dL |
| Urine Protein | Trace | 1+ or greater |

---

*Mamacord AI is a clinical decision support tool. It does not replace the judgement of a qualified healthcare professional.*
