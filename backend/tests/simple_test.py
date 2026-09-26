import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.rag.pdf_loader import load_and_split_pdf
from app.rag.vector_store import create_vector_store
from app.rag.chatbot import advanced_rag_pipeline, conversation_memory

class SimpleRAGTest(unittest.TestCase):
    def test_pipeline_basic(self):
        sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/sample.pdf"))
        chunks = load_and_split_pdf(sample_path)
        self.assertGreater(len(chunks), 0)

        vs = create_vector_store(chunks)
        self.assertIsNotNone(vs)

        answer = advanced_rag_pipeline("What is DBMS?", vs, chunks)
        self.assertIn("Answer", answer)

if __name__ == "__main__":
    unittest.main()
