import os
from typing import List, Tuple, Any
from app.config import EMBEDDING_MODEL_NAME

# Flags for component state
USE_REAL_COMPONENTS = True
REAL_COMPONENTS_TESTED = False

class MockVectorStore:
    """Mock vector store for fallback when FAISS or HuggingFace embeddings are unavailable."""
    def __init__(self, docs: List[Any]):
        self.docs = docs

    def similarity_search(self, query: str, k: int = 3) -> List[Any]:
        """Basic keyword-based retrieval for mock vector store."""
        query_lower = query.lower()
        scored_docs = []

        for doc in self.docs:
            content_lower = doc.page_content.lower() if hasattr(doc, 'page_content') else str(doc).lower()
            score = 0

            query_words = [word for word in query_lower.split() if len(word) > 2]
            for word in query_words:
                if word in content_lower:
                    score += 1

            if query_lower in content_lower:
                score += 5

            related_terms = {
                'dbms': ['database', 'management', 'system', 'data'],
                'concurrency': ['control', 'transaction', 'serializable', 'schedule'],
                'transaction': ['acid', 'atomic', 'commit', 'rollback'],
                'database': ['dbms', 'sql', 'table', 'query'],
                'control': ['concurrency', 'locking', 'deadlock', 'serialization']
            }

            for key, terms in related_terms.items():
                if key in query_lower:
                    for term in terms:
                        if term in content_lower:
                            score += 0.5

            scored_docs.append((doc, score))

        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return [doc for doc, score in scored_docs[:k]]

    def similarity_search_with_score(self, query: str, k: int = 5) -> List[Tuple[Any, float]]:
        """Mock similarity search returning (doc, score) tuples."""
        query_lower = query.lower()
        scored_docs = []

        for doc in self.docs:
            content_lower = doc.page_content.lower() if hasattr(doc, 'page_content') else str(doc).lower()
            score = 0.1

            query_words = [word for word in query_lower.split() if len(word) > 2]
            for word in query_words:
                if word in content_lower:
                    score += 0.2

            if query_lower in content_lower:
                score += 0.4

            # Normalize score to float between 0.4 and 0.95
            score = min(0.95, max(0.40, score))
            scored_docs.append((doc, float(score)))

        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return scored_docs[:k]

def create_vector_store(chunks: List[Any]) -> Any:
    """Create FAISS vector store with HuggingFace embeddings if available, else MockVectorStore."""
    global USE_REAL_COMPONENTS, REAL_COMPONENTS_TESTED

    if not REAL_COMPONENTS_TESTED:
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import FAISS
            REAL_COMPONENTS_TESTED = True
            print(f"Real RAG components available (Using model: {EMBEDDING_MODEL_NAME})")
        except ImportError as e:
            USE_REAL_COMPONENTS = False
            REAL_COMPONENTS_TESTED = True
            print(f"Using mock components: {e}")

    if USE_REAL_COMPONENTS:
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import FAISS
            embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
            vector_store = FAISS.from_documents(chunks, embeddings)
            return vector_store
        except Exception as e:
            print(f"Error creating real vector store: {e}, falling back to mock vector store")
            USE_REAL_COMPONENTS = False

    return MockVectorStore(chunks)

def get_top_chunks(vector_store: Any, query: str, k: int = 3) -> List[Any]:
    """Retrieve top-k chunks using MMR search if available, otherwise similarity search."""
    if hasattr(vector_store, 'max_marginal_relevance_search'):
        try:
            docs = vector_store.max_marginal_relevance_search(query, k=k, fetch_k=20)
            return docs
        except Exception as e:
            print(f"Error with MMR search: {e}, falling back to similarity search")
            try:
                return vector_store.similarity_search(query, k=k)
            except Exception as e2:
                print(f"Error with similarity search: {e2}")

    return vector_store.similarity_search(query, k=k)

def retrieve_with_scores(vector_store: Any, query: str, k: int = 5) -> List[Tuple[Any, float]]:
    """Retrieve chunks with similarity scores for ranking."""
    try:
        if hasattr(vector_store, 'similarity_search_with_score'):
            results = vector_store.similarity_search_with_score(query, k=k)
            return results
        else:
            docs = vector_store.similarity_search(query, k=k)
            return [(doc, 0.75) for doc in docs]
    except Exception as e:
        print(f"Error in retrieval with scores: {e}")
        docs = vector_store.similarity_search(query, k=k)
        return [(doc, 0.75) for doc in docs]
