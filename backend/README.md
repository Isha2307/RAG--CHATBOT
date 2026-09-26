# IntelliRAG Backend API

AI-Powered Document Assistant Backend built with Python, FastAPI, LangChain, HuggingFace embeddings, and FAISS.

## Features

- **Document Processing**: PyPDF parsing with `RecursiveCharacterTextSplitter`.
- **Embeddings & Vector Database**: `sentence-transformers/all-mpnet-base-v2` with FAISS vector store.
- **Advanced Retrieval**: Query rewriting, MMR retrieval, and Cross-Encoder reranking (`cross-encoder/ms-marco-MiniLM-L-6-v2`).
- **REST APIs**: `/api/health`, `/api/upload`, `/api/chat`, `/api/documents`, `/api/clear` (with legacy fallback endpoints).

## Render Live API

Live Backend URL: `https://rag-chatbot-1-5n2r.onrender.com`

## Setup & Running Locally

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
