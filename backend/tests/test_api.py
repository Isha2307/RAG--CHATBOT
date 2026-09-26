import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api import app

class APITest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_api_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("ready", data)

    def test_api_documents(self):
        response = self.client.get("/api/documents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("documents", data)

    def test_api_clear(self):
        response = self.client.post("/api/clear")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)

if __name__ == "__main__":
    unittest.main()
