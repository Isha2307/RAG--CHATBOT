import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Default paths
DEFAULT_PDF_PATH = os.getenv("DEFAULT_PDF_PATH", str(DATA_DIR / "sample.pdf"))

# Model configuration
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2" if os.environ.get("RENDER") else "sentence-transformers/all-mpnet-base-v2"
)
CROSS_ENCODER_MODEL_NAME = os.getenv("CROSS_ENCODER_MODEL_NAME", "cross-encoder/ms-marco-MiniLM-L-6-v2")
LLM_REWRITER_MODEL_NAME = os.getenv("LLM_REWRITER_MODEL_NAME", "google/flan-t5-small")

# RAG Hyperparameters
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 100
MAX_HISTORY_EXCHANGES = 5
TOP_K_RETRIEVAL = 5
TOP_K_FINAL = 3

# Port & Environment
PORT = int(os.getenv("PORT", 8000))
IS_RENDER = bool(os.getenv("RENDER"))
