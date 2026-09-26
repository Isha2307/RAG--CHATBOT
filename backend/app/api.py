import os
import shutil
import warnings
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import markdown

warnings.filterwarnings("ignore")
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "true"

from app.config import DEFAULT_PDF_PATH, DATA_DIR
from app.rag.pdf_loader import load_and_split_pdf
from app.rag.vector_store import create_vector_store
from app.rag.chatbot import (
    advanced_rag_pipeline,
    run_rag_pipeline_details,
    conversation_memory
)

app = FastAPI(
    title="IntelliRAG API",
    description="AI-Powered Document Assistant Backend API (Local & Render Compatible)",
    version="2.0.0"
)

# Configure CORS dynamically for local & deployed frontends (Render, Vercel, Netlify, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application global state
app_state = {
    "vector_store": None,
    "chunks": None,
    "pdf_path": DEFAULT_PDF_PATH,
    "active_filename": os.path.basename(DEFAULT_PDF_PATH),
    "ready": False,
    "error_message": None
}

class ChatRequest(BaseModel):
    query: str

def initialize_vector_store(pdf_path: str):
    """Internal helper to load and index a PDF file into FAISS vector store."""
    if not os.path.exists(pdf_path):
        app_state["ready"] = False
        app_state["error_message"] = f"File not found: {pdf_path}"
        print(f"Warning: PDF path '{pdf_path}' does not exist.")
        return False

    try:
        print(f"Indexing PDF document: {pdf_path}")
        chunks = load_and_split_pdf(pdf_path)
        vector_store = create_vector_store(chunks)

        app_state["chunks"] = chunks
        app_state["vector_store"] = vector_store
        app_state["pdf_path"] = pdf_path
        app_state["active_filename"] = os.path.basename(pdf_path)
        app_state["ready"] = True
        app_state["error_message"] = None
        print(f"Indexing complete! {len(chunks)} chunks created for {app_state['active_filename']}.")
        return True
    except Exception as e:
        print(f"Error during vector store initialization: {e}")
        app_state["ready"] = False
        app_state["error_message"] = str(e)
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize default document index on startup."""
    print("Initializing IntelliRAG RAG Backend...")
    initialize_vector_store(app_state["pdf_path"])

@app.get("/api/health")
@app.get("/health")  # Support legacy /health route
async def health_check():
    """Health check endpoint returning system readiness and status."""
    return {
        "status": "online" if app_state["ready"] else "indexing_required",
        "ready": app_state["ready"],
        "active_document": app_state["active_filename"],
        "chunk_count": len(app_state["chunks"]) if app_state["chunks"] else 0,
        "memory_exchanges": len(conversation_memory.history),
        "error": app_state["error_message"]
    }

@app.get("/api/documents")
@app.get("/documents")
async def get_documents():
    """Get list of available sample PDF documents and active status."""
    docs = []
    if os.path.exists(DATA_DIR):
        for fname in os.listdir(DATA_DIR):
            if fname.endswith(".pdf"):
                filepath = os.path.join(DATA_DIR, fname)
                size_mb = round(os.path.getsize(filepath) / (1024 * 1024), 2)
                docs.append({
                    "filename": fname,
                    "size_mb": size_mb,
                    "is_active": fname == app_state["active_filename"],
                    "status": "ready" if fname == app_state["active_filename"] and app_state["ready"] else "available"
                })
    return {
        "active_document": app_state["active_filename"],
        "documents": docs
    }

@app.post("/api/select_document")
async def select_document(filename: str = Query(...)):
    """Select an existing document from data/ to make active."""
    target_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail=f"Document '{filename}' not found.")

    success = initialize_vector_store(target_path)
    if success:
        conversation_memory.clear()
        return {
            "message": f"Document '{filename}' set as active and re-indexed.",
            "filename": filename,
            "chunk_count": len(app_state["chunks"])
        }
    else:
        raise HTTPException(status_code=500, detail=app_state["error_message"] or "Indexing failed")

@app.post("/api/upload")
@app.post("/upload")  # Support legacy /upload route
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a new PDF document, process, and re-index the vector store."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    os.makedirs(DATA_DIR, exist_ok=True)
    safe_filename = file.filename.replace(" ", "_")
    saved_pdf_path = os.path.join(DATA_DIR, safe_filename)

    try:
        with open(saved_pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Copy to sample.pdf for default fallback compatibility
        sample_path = os.path.join(DATA_DIR, "sample.pdf")
        shutil.copyfile(saved_pdf_path, sample_path)

        success = initialize_vector_store(saved_pdf_path)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to process and index PDF document.")

        conversation_memory.clear()
        return {
            "message": "PDF uploaded and indexed successfully!",
            "filename": safe_filename,
            "chunk_count": len(app_state["chunks"]),
            "ready": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@app.post("/api/chat")
@app.post("/chat")  # Support legacy /chat route
async def chat(request: ChatRequest):
    """Process user query through advanced RAG pipeline."""
    if not app_state["ready"] or app_state["vector_store"] is None:
        if not initialize_vector_store(app_state["pdf_path"]):
            raise HTTPException(status_code=400, detail="The RAG system is not ready. Please upload a PDF document first.")

    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if request.query.lower().strip() == "clear":
        conversation_memory.clear()
        return {
            "answer": "<p>Conversation memory cleared.</p>",
            "raw_answer": "Conversation memory cleared.",
            "sources": [],
            "rewritten_query": request.query
        }

    try:
        pipeline_result = run_rag_pipeline_details(
            request.query.strip(),
            app_state["vector_store"],
            app_state["chunks"]
        )

        html_answer = markdown.markdown(pipeline_result["answer"])

        return {
            "answer": html_answer,
            "raw_answer": pipeline_result["answer"],
            "sources": pipeline_result["sources"],
            "rewritten_query": pipeline_result["rewritten_query"],
            "active_document": app_state["active_filename"],
            "memory_context": conversation_memory.get_context()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query in RAG pipeline: {str(e)}")

@app.post("/api/clear")
async def clear_history():
    """Clear conversation history memory."""
    conversation_memory.clear()
    return {"message": "Conversation history cleared successfully."}

@app.get("/")
@app.head("/")
async def root():
    """Root endpoint info."""
    return {
        "name": "IntelliRAG API",
        "status": "running",
        "ready": app_state["ready"],
        "active_document": app_state["active_filename"],
        "documentation": "/docs"
    }
