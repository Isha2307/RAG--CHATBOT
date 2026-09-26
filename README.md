# IntelliRAG — AI-Powered Document Assistant

> **Enterprise Full-Stack RAG SaaS Application** built for real-time document search, intelligent text retrieval, Cross-Encoder reranking, and grounded answer synthesis. Submitted for Software Development Engineer role evaluation.

---

## 🌟 Overview

**IntelliRAG** transforms static PDF documents into an interactive conversational intelligence platform. By combining dense vector embeddings with multi-stage reranking and structured answer generation, IntelliRAG allows users to query complex documents and receive accurate, cited answers with document-level confidence metrics.

---

## 🎯 Problem Statement

Traditional document search relies on naive keyword matching (BM25/grep), which fails to capture semantic meaning, context, or complex technical relationships within large document sets. IntelliRAG solves this by providing:

1. **Semantic Search & Document Retrieval**: Converting document text into dense embedding spaces (`all-mpnet-base-v2`).
2. **Contextual Reranking**: Eliminating low-relevance results using Cross-Encoder models (`cross-encoder/ms-marco-MiniLM-L-6-v2`).
3. **Structured Answer Synthesis**: Generating human-readable summaries complete with source chunk previews and confidence percentages.

---

## ✨ Features

- **📄 Document Upload & Processing**: Instant PDF parsing using `PyPDF` and chunking via `RecursiveCharacterTextSplitter`.
- **⚡ Vector Database**: High-speed similarity search powered by `FAISS`.
- **🧠 Advanced RAG Pipeline**:
  - **Query Expansion & Rewriting**: Optimizes short/ambiguous queries before vector lookup.
  - **Maximal Marginal Relevance (MMR)**: Enhances document diversity.
  - **Cross-Encoder Reranking**: Re-scores candidate chunks for precision.
- **💬 Conversation Memory**: Retains multi-turn dialogue context across exchanges.
- **🎨 Recruiter-Ready AI SaaS Interface**:
  - Modern Next.js 16 (App Router) + React + TypeScript + Tailwind CSS design system.
  - Interactive ChatGPT-style conversation view with markdown rendering.
  - Live **Sources Panel** displaying actual confidence scores, chunk previews, and source filenames.
  - Responsive left sidebar with query history, system status indicators, and active document switching.

---

## 🏗️ RAG & System Architecture

```
                    INTELLIRAG
                        │
                        ▼
              Next.js + React Frontend (TypeScript)
                        │
                        │ REST API (JSON)
                        ▼
                 Python FastAPI Backend
                        │
                        ▼
              Advanced RAG Pipeline
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   FAISS Vector    HuggingFace     Cross-Encoder
     Database       Embeddings       Reranking
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 Context Synthesis
                        │
                        ▼
            Structured Answer & Sources
```

---

## 🛠️ Technology Stack

### **Backend**
- **Python 3.10+**
- **FastAPI & Uvicorn** (REST API Framework)
- **LangChain** (RAG Orchestration & Text Splitters)
- **HuggingFace Transformers / Sentence-Transformers** (`all-mpnet-base-v2` & `ms-marco-MiniLM-L-6-v2`)
- **FAISS (Facebook AI Similarity Search)** (Vector Indexing)
- **PyPDF** (PDF Parsing)

### **Frontend**
- **Next.js 16 (App Router)** & **React 19**
- **TypeScript** (Strict Type Safety)
- **Tailwind CSS v4** (Modern Dark Theme UI)
- **Lucide React** (Professional Iconography)
- **React Markdown** (Formatted Answer Rendering)

---

## 📁 Project Structure

```
RAG/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application launcher
│   │   ├── api.py               # REST API endpoints (/api/chat, /api/upload, etc.)
│   │   ├── config.py            # Global configuration settings
│   │   │
│   │   └── rag/
│   │       ├── __init__.py
│   │       ├── chatbot.py       # Advanced RAG pipeline, reranker, memory
│   │       ├── loader.py        # PDF loader module wrapper
│   │       ├── pdf_loader.py    # PyPDF loader & Recursive Character Splitter
│   │       └── vector_store.py  # FAISS vector store & MMR retrieval
│   │
│   ├── data/                    # Sample PDF documents
│   ├── tests/                   # Pytest & unit tests suite
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   └── README.md
│
├── frontend/
│   ├── app/                     # Next.js App Router (page.tsx, layout.tsx)
│   ├── components/
│   │   ├── chat/                # ChatContainer, ChatMessage, ChatComposer, EmptyState
│   │   ├── documents/           # DocumentPanel, UploadModal
│   │   ├── layout/              # Sidebar, Header, SourcesPanel
│   │   └── ui/                  # Badge, LoadingSpinner
│   │
│   ├── lib/
│   │   ├── api.ts               # Centralized REST API client
│   │   └── types.ts             # TypeScript interfaces
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example             # Frontend environment template
│   └── README.md
│
├── README.md                    # Root project documentation
├── .gitignore
└── start_demo.bat               # Windows 1-click startup script
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js v18+** & **npm**

---

### Option 1: One-Click Start (Windows)
Double click `start_demo.bat` or run:
```cmd
start_demo.bat
```
This automatically starts both the FastAPI backend (`http://127.0.0.1:8000`) and the Next.js frontend (`http://localhost:3000`), then opens your browser.

---

### Option 2: Manual Terminal Setup

#### **1. Backend Setup**
```bash
# Navigate to backend environment
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend server will start at `http://127.0.0.1:8000` (API documentation available at `http://127.0.0.1:8000/docs`).

#### **2. Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Run Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend readiness, active document, chunk count, and memory state. |
| `GET` | `/api/documents` | Lists available sample PDF files and their indexing statuses. |
| `POST` | `/api/select_document` | Switches the active document and re-indexes vector store. |
| `POST` | `/api/upload` | Uploads a new PDF document, splits text, and indexes in FAISS. |
| `POST` | `/api/chat` | Executes the complete RAG pipeline and returns answer + source cards. |
| `POST` | `/api/clear` | Clears conversation history memory. |

---

## 🧪 Testing

### Backend Unit Tests
```bash
# Run backend tests
python -m unittest discover backend/tests
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```
*Passed with zero TypeScript or build errors.*

---

## 🚀 Future Improvements

- Multi-document parallel search over vector indexes.
- Hybrid BM25 + Dense vector retrieval fusion (RRF).
- Export conversation transcripts as Markdown / PDF.