import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.rag.pdf_loader import load_and_split_pdf
from app.rag.vector_store import create_vector_store
from app.rag.chatbot import advanced_rag_pipeline

def main():
    sample_path = backend_dir / "data" / "sample.pdf"
    if not sample_path.exists():
        print(f"Sample PDF not found at {sample_path}")
        return

    print("--- Demonstrating Advanced RAG Features ---")
    chunks = load_and_split_pdf(str(sample_path))
    print(f"Total chunks loaded: {len(chunks)}")

    vector_store = create_vector_store(chunks)
    query = "Explain concurrency control and ACID properties"
    print(f"Query: {query}\n")

    answer = advanced_rag_pipeline(query, vector_store, chunks)
    print("--- Generated Structured Answer ---")
    print(answer)

if __name__ == "__main__":
    main()
