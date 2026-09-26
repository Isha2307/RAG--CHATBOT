import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.rag.pdf_loader import load_and_split_pdf
from app.rag.vector_store import create_vector_store, retrieve_with_scores
from app.rag.chatbot import advanced_rag_pipeline, conversation_memory

class RAGPipelineTest(unittest.TestCase):
    def test_pdf_loader_and_splitting(self):
        sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/sample.pdf"))
        chunks = load_and_split_pdf(sample_path)
        self.assertGreater(len(chunks), 0)

    def test_vector_store_creation_and_retrieval(self):
        sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/sample.pdf"))
        chunks = load_and_split_pdf(sample_path)
        vector_store = create_vector_store(chunks)
        self.assertIsNotNone(vector_store)

        results = retrieve_with_scores(vector_store, "DBMS", k=3)
        self.assertGreater(len(results), 0)

    def test_rag_pipeline_answer_generation(self):
        sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/sample.pdf"))
        chunks = load_and_split_pdf(sample_path)
        vector_store = create_vector_store(chunks)

        answer = advanced_rag_pipeline("What is DBMS?", vector_store, chunks)
        self.assertIsNotNone(answer)
        self.assertGreater(len(answer), 0)

    def test_conversation_memory(self):
        conversation_memory.clear()
        self.assertEqual(conversation_memory.get_context(), "")
        conversation_memory.add_exchange("Q", "A")
        self.assertIn("Q", conversation_memory.get_context())

if __name__ == "__main__":
    unittest.main()
