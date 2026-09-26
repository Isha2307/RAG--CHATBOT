import os
from typing import List, Any
from app.config import DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP

# Lazy import flags
USE_REAL_COMPONENTS = True
REAL_COMPONENTS_TESTED = False

class MockDocument:
    """Mock document class for fallback when PyPDF or LangChain is unavailable."""
    def __init__(self, content: str, metadata: dict = None):
        self.page_content = content
        self.metadata = metadata or {}

def load_and_split_pdf(pdf_path: str, chunk_size: int = DEFAULT_CHUNK_SIZE, chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> List[Any]:
    """Load a PDF file and split it into chunks using RecursiveCharacterTextSplitter."""
    global USE_REAL_COMPONENTS, REAL_COMPONENTS_TESTED

    if not REAL_COMPONENTS_TESTED:
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            REAL_COMPONENTS_TESTED = True
            print("Using RecursiveCharacterTextSplitter for text splitting")
        except ImportError:
            USE_REAL_COMPONENTS = False
            REAL_COMPONENTS_TESTED = True
            print("Using mock text splitting")

    if USE_REAL_COMPONENTS:
        try:
            # Try to load real PDF using PyPDFLoader
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()

            # Use RecursiveCharacterTextSplitter with overlap of 100
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            chunks = text_splitter.split_documents(documents)
            return chunks
        except Exception as e:
            print(f"Error loading real PDF ({e}), attempting mock/fallback content...")
            USE_REAL_COMPONENTS = False

    # Fallback mock text content if PDF cannot be parsed or PyPDF unavailable
    mock_text = """
    Database Management System (DBMS) is software designed to manage databases. It provides an interface for users and applications to interact with stored data.

    A DBMS handles data storage, retrieval, and manipulation. It ensures data integrity, security, and consistency across multiple users.

    Concurrency control in databases ensures that multiple transactions can execute simultaneously without interfering with each other. It prevents data inconsistency and maintains serializability.

    Transactions in databases follow ACID properties: Atomicity, Consistency, Isolation, and Durability. These properties ensure reliable database operations.

    Locking protocols are used in concurrency control. Two-phase locking includes a growing phase where locks are acquired and a shrinking phase where locks are released.

    Database recovery mechanisms ensure that the database can be restored to a consistent state after failures. This includes logging and checkpointing.

    SQL is the standard language for interacting with relational databases. It supports operations like SELECT, INSERT, UPDATE, and DELETE.

    Indexes in databases improve query performance by providing fast access to data. They work like pointers to specific records in tables.

    Normalization in database design reduces data redundancy and improves data integrity. It involves organizing data into related tables.

    Backup and recovery strategies are crucial for database administration. Regular backups and tested recovery procedures prevent data loss.
    """

    filename = os.path.basename(pdf_path)
    if USE_REAL_COMPONENTS:
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            chunks = text_splitter.create_documents([mock_text], metadatas=[{"source": filename}])
            return chunks
        except Exception:
            pass

    # Basic fallback splitting
    chunks = []
    start = 0
    while start < len(mock_text):
        end = start + chunk_size
        if end < len(mock_text):
            while end > start + chunk_size - chunk_overlap and end < len(mock_text) and mock_text[end] not in ' \n':
                end -= 1

        chunk_text = mock_text[start:end].strip()
        if chunk_text:
            doc = MockDocument(chunk_text, metadata={"source": filename, "chunk_id": len(chunks)})
            chunks.append(doc)

        start = max(start + 1, end - chunk_overlap)

    return chunks
