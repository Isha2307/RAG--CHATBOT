import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.rag.chatbot import rewrite_query, conversation_memory

class AdvancedFeaturesTest(unittest.TestCase):
    def test_query_rewriting(self):
        rewritten = rewrite_query("dbms")
        self.assertIn("database management system", rewritten.lower())

    def test_conversation_memory(self):
        conversation_memory.clear()
        conversation_memory.add_exchange("Q1", "A1")
        ctx = conversation_memory.get_context()
        self.assertIn("Q1", ctx)

if __name__ == "__main__":
    unittest.main()
