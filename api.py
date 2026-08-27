import os
import warnings
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import markdown

# Suppress HuggingFace and other warnings to keep the terminal clean
warnings.filterwarnings("ignore")
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "true"

# Import from the existing CLI application
from main import (
    load_and_split_pdf,
    create_vector_store,
    advanced_rag_pipeline,
    conversation_memory
)

app = FastAPI(title="Advanced RAG Chatbot API")

# Add CORS middleware to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory for the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Global state for the vector store and chunks
app_state = {
    "vector_store": None,
    "chunks": None,
    "pdf_path": "data/sample.pdf",
    "ready": False
}

class ChatRequest(BaseModel):
    query: str

@app.on_event("startup")
async def startup_event():
    """Load the default PDF and initialize the vector store on startup."""
    print("Initializing RAG backend...")
    if os.path.exists(app_state["pdf_path"]):
        try:
            print(f"Loading {app_state['pdf_path']}...")
            app_state["chunks"] = load_and_split_pdf(app_state["pdf_path"])
            app_state["vector_store"] = create_vector_store(app_state["chunks"])
            app_state["ready"] = True
            print("Initialization complete.")
        except Exception as e:
            print(f"Error during startup initialization: {e}")
    else:
        print(f"No PDF found at {app_state['pdf_path']}. Waiting for upload.")

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a new PDF document and re-index the vector store."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    os.makedirs("data", exist_ok=True)
    pdf_path = os.path.join("data", "sample.pdf")
    
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    app_state["pdf_path"] = pdf_path
    app_state["ready"] = False
    
    try:
        app_state["chunks"] = load_and_split_pdf(pdf_path)
        app_state["vector_store"] = create_vector_store(app_state["chunks"])
        app_state["ready"] = True
        # Clear memory for the new document
        conversation_memory.clear()
        return {"message": "PDF uploaded and indexed successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    """Process a user query and return the RAG answer."""
    if not app_state["ready"]:
        raise HTTPException(status_code=400, detail="The system is not ready. Please upload a PDF first.")
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    if request.query.lower() == "clear":
        conversation_memory.clear()
        return {"answer": "<p>Conversation memory cleared.</p>"}
    
    try:
        raw_answer = advanced_rag_pipeline(
            request.query, 
            app_state["vector_store"], 
            app_state["chunks"]
        )
        
        # Convert markdown output to HTML for easy rendering in frontend
        html_answer = markdown.markdown(raw_answer)
        
        return {"answer": html_answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/")
async def root():
    """Redirect to the static frontend."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/static/index.html")
