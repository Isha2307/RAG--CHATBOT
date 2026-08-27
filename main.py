import os
from dotenv import load_dotenv
from typing import List, Tuple, Optional, Dict
from collections import deque

# Load environment variables from .env file
load_dotenv()

# Lazy import flags - components will be imported when actually needed
USE_REAL_COMPONENTS = True
REAL_COMPONENTS_TESTED = False
CROSS_ENCODER_AVAILABLE = False
QUERY_REWRITER_AVAILABLE = False

# Conversation memory - stores last 5 exchanges for context
class ConversationMemory:
    """Store conversation history for context-aware responses"""
    def __init__(self, max_history: int = 5):
        self.history = deque(maxlen=max_history)
    
    def add_exchange(self, query: str, answer: str):
        """Add a query-answer pair to memory"""
        self.history.append({"query": query, "answer": answer})
    
    def get_context(self) -> str:
        """Get conversation history as context string"""
        if not self.history:
            return ""
        
        context_lines = ["Previous conversation context:"]
        for i, exchange in enumerate(self.history, 1):
            context_lines.append(f"Q{i}: {exchange['query']}")
            context_lines.append(f"A{i}: {exchange['answer'][:100]}...")
        
        return "\n".join(context_lines)
    
    def clear(self):
        """Clear conversation history"""
        self.history.clear()

# Initialize global conversation memory
conversation_memory = ConversationMemory()

# PDF loading and text splitting
def load_and_split_pdf(pdf_path, chunk_size=1000, chunk_overlap=100):
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
            # Try to load real PDF
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
            print(f"Error loading real PDF: {e}, using mock content")
            USE_REAL_COMPONENTS = False

    # Fallback to mock content with RecursiveCharacterTextSplitter
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

    # Use RecursiveCharacterTextSplitter even for mock content
    if USE_REAL_COMPONENTS:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.create_documents([mock_text])
    else:
        # Basic fallback splitting
        chunks = []
        start = 0
        while start < len(mock_text):
            end = start + chunk_size
            if end < len(mock_text):
                # Find a good break point
                while end > start + chunk_size - chunk_overlap and end < len(mock_text) and mock_text[end] not in ' \n':
                    end -= 1

            chunk_text = mock_text[start:end].strip()
            if chunk_text:
                doc = MockDocument(chunk_text)
                doc.metadata = {"source": pdf_path, "chunk_id": len(chunks)}
                chunks.append(doc)

            start = max(start + 1, end - chunk_overlap)

    return chunks

# Simple mock implementations for testing
class MockDocument:
    def __init__(self, content):
        self.page_content = content
        self.metadata = {}  # FAISS expects this attribute

class MockVectorStore:
    def __init__(self, docs):
        self.docs = docs

    def similarity_search(self, query, k=3):
        """Basic keyword-based retrieval for mock vector store"""
        query_lower = query.lower()
        scored_docs = []

        for doc in self.docs:
            content_lower = doc.page_content.lower()
            score = 0

            # Score based on keyword matches
            query_words = [word for word in query_lower.split() if len(word) > 2]
            for word in query_words:
                if word in content_lower:
                    score += 1

            # Boost score for exact phrase matches
            if query_lower in content_lower:
                score += 5

            # Boost score for related terms
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

        # Sort by score (highest first) and return top k
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return [doc for doc, score in scored_docs[:k]]

def create_vector_store(chunks):
    """Create vector store with real embeddings if available, otherwise mock"""
    global USE_REAL_COMPONENTS, REAL_COMPONENTS_TESTED

    if not REAL_COMPONENTS_TESTED:
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_community.vectorstores import FAISS
            REAL_COMPONENTS_TESTED = True
            print("Real RAG components available")
        except ImportError as e:
            USE_REAL_COMPONENTS = False
            REAL_COMPONENTS_TESTED = True
            print(f"Using mock components: {e}")

    if USE_REAL_COMPONENTS:
        try:
            # Create HuggingFace embeddings
            from langchain_huggingface import HuggingFaceEmbeddings
            model_name = "sentence-transformers/all-MiniLM-L6-v2" if os.environ.get("RENDER") else "sentence-transformers/all-mpnet-base-v2"
            embeddings = HuggingFaceEmbeddings(model_name=model_name)
            # Create FAISS vector store
            from langchain_community.vectorstores import FAISS
            vector_store = FAISS.from_documents(chunks, embeddings)
            return vector_store
        except Exception as e:
            print(f"Error creating real vector store: {e}, falling back to mock")
            USE_REAL_COMPONENTS = False

    # Fallback to mock
    return MockVectorStore(chunks)


def get_top_chunks(vector_store, query, k=3):
    """Retrieve top-k chunks using MMR search if available, otherwise similarity search."""
    if USE_REAL_COMPONENTS and hasattr(vector_store, 'max_marginal_relevance_search'):
        try:
            # Use max marginal relevance search for diverse results
            docs = vector_store.max_marginal_relevance_search(query, k=k, fetch_k=20)
            return docs
        except Exception as e:
            print(f"Error with MMR search: {e}, falling back to similarity search")
            try:
                docs = vector_store.similarity_search(query, k=k)
                return docs
            except Exception as e2:
                print(f"Error with similarity search: {e2}, falling back to mock")
                USE_REAL_COMPONENTS = False

    # Fallback to similarity search (mock or real)
    return vector_store.similarity_search(query, k=k)


def retrieve_with_scores(vector_store, query: str, k: int = 5) -> List[Tuple]:
    """Retrieve chunks with similarity scores for ranking"""
    try:
        # Try to use similarity_search_with_score if available (FAISS provides this)
        if hasattr(vector_store, 'similarity_search_with_score'):
            results = vector_store.similarity_search_with_score(query, k=k)
            return results  # Returns list of (doc, score) tuples
        else:
            # Fallback: use regular similarity search
            docs = vector_store.similarity_search(query, k=k)
            # Return with dummy scores for mock store
            return [(doc, 0.5) for doc in docs]
    except Exception as e:
        print(f"Error in retrieval with scores: {e}")
        docs = vector_store.similarity_search(query, k=k)
        return [(doc, 0.5) for doc in docs]


def rerank_documents(query: str, documents: List, scores: List[float]) -> List[Tuple]:
    """Rerank retrieved documents using cross-encoder model for better relevance"""
    global CROSS_ENCODER_AVAILABLE
    
    try:
        from sentence_transformers import CrossEncoder
        
        # Load cross-encoder model for reranking
        reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
        # Prepare pairs of (query, document_text)
        doc_texts = [doc.page_content for doc in documents]
        pairs = [[query, doc_text] for doc_text in doc_texts]
        
        # Get reranking scores
        rerank_scores = reranker.predict(pairs)
        
        # Apply sigmoid to convert logits to probabilities (0-1 range)
        import torch
        rerank_scores = torch.sigmoid(torch.tensor(rerank_scores)).numpy()
        
        # Combine documents with reranking scores
        ranked_results = list(zip(documents, rerank_scores))
        
        # Sort by reranking score (descending)
        ranked_results.sort(key=lambda x: x[1], reverse=True)
        
        CROSS_ENCODER_AVAILABLE = True
        return ranked_results
        
    except ImportError:
        print("Cross-encoder not available, using retrieval scores only")
        CROSS_ENCODER_AVAILABLE = False
        # Return original documents with original scores
        return list(zip(documents, scores))
    except Exception as e:
        print(f"Error in reranking: {e}, using original scores")
        CROSS_ENCODER_AVAILABLE = False
        return list(zip(documents, scores))


def rewrite_query(original_query: str) -> str:
    """Rewrite query using simple expansion for short queries or LLM for longer ones"""
    global QUERY_REWRITER_AVAILABLE
    
    # Simple expansions for common short queries
    expansions = {
        "dbms": "database management system definition and explanation",
        "sql": "structured query language explanation and usage",
        "rdbms": "relational database management system",
        "nosql": "NoSQL databases types and characteristics",
        "acid": "ACID properties in database transactions",
        "normalization": "database normalization forms and rules",
        "concurrency": "concurrency control in databases",
        "transaction": "database transactions and properties",
        "index": "database indexes types and usage",
        "join": "SQL joins types and examples"
    }
    
    query_lower = original_query.lower().strip()
    if query_lower in expansions:
        rewritten = expansions[query_lower]
        print(f"Original query: {original_query}")
        print(f"Rewritten query: {rewritten}")
        QUERY_REWRITER_AVAILABLE = True
        return rewritten
    
    # For longer queries, try LLM rewriting
    if len(original_query.split()) > 2 and not os.environ.get("RENDER"):
        try:
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
            
            model_name = "google/flan-t5-small"
            
            prompt = f"""Rewrite the following query to be more detailed and optimized for semantic search. 
Make it more specific and comprehensive while maintaining the original intent.
Original query: {original_query}
Rewritten query:"""
            
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            outputs = model.generate(**inputs, max_length=100, num_beams=1, do_sample=False)
            rewritten = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
            
            # Remove the prefix if the model includes it
            if rewritten.startswith("Rewritten query:"):
                rewritten = rewritten.replace("Rewritten query:", "").strip()
            
            QUERY_REWRITER_AVAILABLE = True
            print(f"Original query: {original_query}")
            print(f"Rewritten query: {rewritten}")
            
            return rewritten
            
        except Exception as e:
            print(f"Error in LLM query rewriting: {e}, using original query")
            QUERY_REWRITER_AVAILABLE = False
            return original_query
    
    # For short queries not in expansions, use original
    QUERY_REWRITER_AVAILABLE = True
    return original_query


def generate_structured_answer(query: str, context: str, documents: List, scores: List[float]) -> str:
    """Generate a structured answer with headings, bullet points, and source attribution"""
    
    # Extract key information from context
    query_lower = query.lower()
    sentences = [s.strip() for s in context.split('.') if s.strip()]
    relevant_sentences = []

    for sentence in sentences:
        sentence_lower = sentence.lower()
        # Check if sentence contains query keywords
        if any(word in sentence_lower for word in query_lower.split() if len(word) > 3):
            relevant_sentences.append(sentence)
        # Check for related terms
        elif any(term in sentence_lower for term in ['database', 'dbms', 'data', 'system', 'management', 'concurrency', 'control', 'transaction']):
            relevant_sentences.append(sentence)

    # Build structured answer
    if relevant_sentences:
        # Remove duplicates and limit to most relevant
        unique_sentences = []
        seen = set()
        for sentence in relevant_sentences[:5]:
            sentence_hash = ' '.join(sorted(sentence.lower().split()))
            if sentence_hash not in seen:
                unique_sentences.append(sentence)
                seen.add(sentence_hash)
                if len(unique_sentences) >= 3:
                    break

        # Create structured response
        answer_lines = ["## Answer\n"]
        answer_lines.append("**Key Information:**")
        for i, sentence in enumerate(unique_sentences, 1):
            answer_lines.append(f"- {sentence.strip()}")
        
        # Add source information with confidence scores
        answer_lines.append("\n**Source Documents with Confidence Scores:**\n")
        for i, (doc, score) in enumerate(zip(documents[:3], scores[:3]), 1):
            # Normalize score for better readability
            confidence = min(100, int(score * 100)) if isinstance(score, float) else int(score)
            answer_lines.append(f"{i}. **Confidence: {confidence}%**")
            answer_lines.append(f"   {doc.page_content[:150]}...\n")
        
        return "\n".join(answer_lines)
    else:
        return """## Answer

I couldn't find specific information about your query in the provided context.

**Suggestions:**
- Try rephrasing your question with different keywords
- Check if the relevant documents are loaded in the system
- Ask a more specific question related to database concepts"""


def build_context_string(chunks):
    """Combine matched chunks into a single context string."""
    return "\n\n---\n\n".join([chunk.page_content for chunk in chunks])


def advanced_rag_pipeline(query: str, vector_store, all_chunks: List) -> str:
    """Complete advanced RAG pipeline with all improvements"""
    
    # Step 1: Rewrite query for better semantic search
    rewritten_query = rewrite_query(query)
    
    # Step 2: Retrieve documents with similarity scores
    results_with_scores = retrieve_with_scores(vector_store, rewritten_query, k=5)
    retrieved_docs = [doc for doc, score in results_with_scores]
    retrieval_scores = [score for doc, score in results_with_scores]
    
    # Step 3: Rerank documents for better relevance
    reranked_results = rerank_documents(rewritten_query, retrieved_docs, retrieval_scores)
    
    # Step 4: Limit to top 3 most relevant chunks after reranking
    top_3_results = reranked_results[:3]
    top_3_docs = [doc for doc, score in top_3_results]
    top_3_scores = [score for doc, score in top_3_results]
    
    # Step 5: Build context from top 3 documents
    context = build_context_string(top_3_docs)
    
    # Step 6: Generate structured answer with source attribution and confidence scores
    answer = generate_structured_answer(query, context, top_3_docs, top_3_scores)
    
    # Step 7: Store in conversation memory
    conversation_memory.add_exchange(query, answer)
    
    return answer


def query_with_huggingface(query, context, chunks):
    """Generate an answer using improved text extraction with structured output (legacy function)"""
    print("Using improved text extraction with structured answers")

    # Extract relevant information from context
    query_lower = query.lower()
    sentences = [s.strip() for s in context.split('.') if s.strip()]
    relevant_sentences = []

    for sentence in sentences:
        sentence_lower = sentence.lower()
        # Check if sentence contains query keywords (longer than 3 chars)
        if any(word in sentence_lower for word in query_lower.split() if len(word) > 3):
            relevant_sentences.append(sentence)
        # Check for related terms
        elif any(term in sentence_lower for term in ['database', 'dbms', 'data', 'system', 'management', 'concurrency', 'control', 'transaction']):
            relevant_sentences.append(sentence)

    # Build structured answer
    if relevant_sentences:
        # Remove duplicates and limit to most relevant
        unique_sentences = []
        seen = set()
        for sentence in relevant_sentences[:4]:  # Check up to 4 sentences
            # Create a simple hash to avoid near-duplicates
            sentence_hash = ' '.join(sorted(sentence.lower().split()))
            if sentence_hash not in seen:
                unique_sentences.append(sentence)
                seen.add(sentence_hash)
                if len(unique_sentences) >= 3:  # Limit to 3 sentences max
                    break

        answer = '. '.join(unique_sentences)
        if not answer.endswith('.'):
            answer += '.'

        # Add source information
        source_info = "\n\n**Source Chunks:**\n"
        for i, chunk in enumerate(chunks[:3], 1):  # Show up to 3 source chunks
            source_info += f"{i}. {chunk.page_content[:200]}...\n\n"

        return answer + source_info
    else:
        return "I couldn't find specific information about your query in the provided context. Please try rephrasing your question or check if the relevant documents are loaded.\n\n**Source Chunks:** No relevant chunks found."


def main():
    pdf_path = "data/sample.pdf"

    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        print("Please place your PDF file in the 'data' folder and name it 'sample.pdf'.")
        return

    print("Loading and processing the PDF...")
    chunks = load_and_split_pdf(pdf_path)
    print(f"PDF split into {len(chunks)} chunks.")

    print("Creating embeddings and FAISS vector store with all-mpnet-base-v2 model...")
    vector_store = create_vector_store(chunks)
    print("Vector store created successfully.\n")

    print("=" * 70)
    print("Advanced RAG Pipeline Ready!")
    print("=" * 70)
    print("\nFeatures enabled:")
    print("[*] Query rewriting for better search")
    print("[*] Cross-encoder reranking for relevance")
    print("[*] Similarity score display")
    print("[*] Conversation memory (last 5 exchanges)")
    print("[*] Structured answers with bullet points")
    print("\nCommands:")
    print("  'quit' - Exit the application")
    print("  'history' - View conversation history")
    print("  'clear' - Clear conversation memory")
    print("=" * 70)

    while True:
        query = input("\nEnter your question: ").strip()
        
        if query.lower() == "quit":
            print("Goodbye!")
            break
        
        if query.lower() == "history":
            history_text = conversation_memory.get_context()
            if history_text:
                print("\n" + history_text)
            else:
                print("No conversation history yet.")
            continue
        
        if query.lower() == "clear":
            conversation_memory.clear()
            print("Conversation memory cleared.")
            continue
        
        if not query:
            print("Please enter a non-empty question.")
            continue

        print("\n" + "="*70)
        print("Processing your query with advanced RAG pipeline...")
        print("="*70)
        
        try:
            # Use the advanced RAG pipeline
            final_answer = advanced_rag_pipeline(query, vector_store, chunks)
            
            print("\n" + final_answer)
            print("\n" + "="*70)
        except Exception as e:
            print(f"Error processing query: {e}")
            print("Attempting fallback...")
            
            # Fallback to simple retrieval
            retrieved = get_top_chunks(vector_store, query, k=3)
            context = build_context_string(retrieved)
            fallback_answer = query_with_huggingface(query, context, retrieved)
            
            print("\n" + fallback_answer)
            print("\n" + "="*70)


if __name__ == "__main__":
    main()
