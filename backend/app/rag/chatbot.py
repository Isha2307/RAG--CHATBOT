import os
from collections import deque
from typing import List, Tuple, Dict, Any
from app.config import MAX_HISTORY_EXCHANGES, CROSS_ENCODER_MODEL_NAME, LLM_REWRITER_MODEL_NAME
from app.rag.vector_store import retrieve_with_scores, get_top_chunks

# Status flags
CROSS_ENCODER_AVAILABLE = False
QUERY_REWRITER_AVAILABLE = False

class ConversationMemory:
    """Store conversation history for context-aware responses."""
    def __init__(self, max_history: int = MAX_HISTORY_EXCHANGES):
        self.history = deque(maxlen=max_history)

    def add_exchange(self, query: str, answer: str):
        """Add a query-answer pair to memory."""
        self.history.append({"query": query, "answer": answer})

    def get_context(self) -> str:
        """Get conversation history as context string."""
        if not self.history:
            return ""

        context_lines = ["Previous conversation context:"]
        for i, exchange in enumerate(self.history, 1):
            context_lines.append(f"Q{i}: {exchange['query']}")
            # Strip markdown formatting for cleaner context preview
            clean_ans = exchange['answer'].replace('#', '').replace('*', '')[:120]
            context_lines.append(f"A{i}: {clean_ans}...")

        return "\n".join(context_lines)

    def get_history_list(self) -> List[Dict[str, str]]:
        """Return history as list of dicts."""
        return list(self.history)

    def clear(self):
        """Clear conversation history."""
        self.history.clear()

# Global conversation memory
conversation_memory = ConversationMemory()

def rewrite_query(original_query: str) -> str:
    """Rewrite query using domain expansion dictionary or LLM for search optimization."""
    global QUERY_REWRITER_AVAILABLE

    expansions = {
        "dbms": "database management system definition architectural properties and components",
        "sql": "structured query language syntax DDL DML queries and commands",
        "rdbms": "relational database management system ACID properties tables",
        "nosql": "NoSQL databases key-value document graph store features",
        "acid": "ACID properties atomicity consistency isolation durability in transactions",
        "normalization": "database normalization normal forms 1NF 2NF 3NF BCNF",
        "concurrency": "concurrency control serializability locking protocols two phase locking",
        "transaction": "database transactions isolation levels commit rollback",
        "index": "database indexing B-tree Hash index query optimization",
        "join": "SQL join operations inner outer left right join"
    }

    query_lower = original_query.lower().strip()
    if query_lower in expansions:
        rewritten = expansions[query_lower]
        QUERY_REWRITER_AVAILABLE = True
        return rewritten

    if len(original_query.split()) > 2 and not os.environ.get("RENDER"):
        try:
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
            prompt = f"Rewrite the query to be specific for semantic document retrieval: {original_query}"
            model = AutoModelForSeq2SeqLM.from_pretrained(LLM_REWRITER_MODEL_NAME)
            tokenizer = AutoTokenizer.from_pretrained(LLM_REWRITER_MODEL_NAME)

            inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            outputs = model.generate(**inputs, max_length=100, num_beams=1, do_sample=False)
            rewritten = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

            if rewritten.startswith("Rewritten query:"):
                rewritten = rewritten.replace("Rewritten query:", "").strip()

            QUERY_REWRITER_AVAILABLE = True
            return rewritten
        except Exception:
            QUERY_REWRITER_AVAILABLE = False
            return original_query

    QUERY_REWRITER_AVAILABLE = True
    return original_query

def rerank_documents(query: str, documents: List[Any], scores: List[float]) -> List[Tuple[Any, float]]:
    """Rerank retrieved documents using CrossEncoder for maximum relevance."""
    global CROSS_ENCODER_AVAILABLE

    try:
        from sentence_transformers import CrossEncoder
        import torch

        reranker = CrossEncoder(CROSS_ENCODER_MODEL_NAME)
        doc_texts = [doc.page_content if hasattr(doc, 'page_content') else str(doc) for doc in documents]
        pairs = [[query, doc_text] for doc_text in doc_texts]

        rerank_logits = reranker.predict(pairs)
        rerank_scores = torch.sigmoid(torch.tensor(rerank_logits)).numpy()

        ranked_results = list(zip(documents, [float(s) for s in rerank_scores]))
        ranked_results.sort(key=lambda x: x[1], reverse=True)

        CROSS_ENCODER_AVAILABLE = True
        return ranked_results

    except ImportError:
        CROSS_ENCODER_AVAILABLE = False
        return list(zip(documents, scores))
    except Exception:
        CROSS_ENCODER_AVAILABLE = False
        return list(zip(documents, scores))

def build_context_string(chunks: List[Any]) -> str:
    """Combine matched chunks into a single context string."""
    contents = []
    for chunk in chunks:
        if hasattr(chunk, 'page_content'):
            contents.append(chunk.page_content)
        else:
            contents.append(str(chunk))
    return "\n\n---\n\n".join(contents)

def generate_structured_answer(query: str, context: str, documents: List[Any], scores: List[float]) -> str:
    """Generate a structured markdown answer with headings, key points, and source attributions."""
    query_lower = query.lower()
    sentences = [s.strip() for s in context.split('.') if s.strip()]
    relevant_sentences = []

    for sentence in sentences:
        sentence_lower = sentence.lower()
        if any(word in sentence_lower for word in query_lower.split() if len(word) > 3):
            relevant_sentences.append(sentence)
        elif any(term in sentence_lower for term in ['database', 'dbms', 'data', 'system', 'management', 'concurrency', 'control', 'transaction', 'learning', 'model', 'algorithm']):
            relevant_sentences.append(sentence)

    if relevant_sentences:
        unique_sentences = []
        seen = set()
        for sentence in relevant_sentences[:5]:
            sentence_hash = ' '.join(sorted(sentence.lower().split()))
            if sentence_hash not in seen:
                unique_sentences.append(sentence)
                seen.add(sentence_hash)
                if len(unique_sentences) >= 3:
                    break

        answer_lines = ["## Answer\n"]
        answer_lines.append("**Key Insights from Document:**")
        for sentence in unique_sentences:
            answer_lines.append(f"- {sentence.strip()}")

        answer_lines.append("\n**Source Documents with Confidence Scores:**\n")
        for i, (doc, score) in enumerate(zip(documents[:3], scores[:3]), 1):
            confidence = min(100, int(score * 100)) if isinstance(score, float) else int(score)
            source_name = getattr(doc, 'metadata', {}).get('source', 'Uploaded PDF') if hasattr(doc, 'metadata') else 'Document Chunk'
            content_preview = doc.page_content[:150] if hasattr(doc, 'page_content') else str(doc)[:150]
            answer_lines.append(f"{i}. **[{source_name}] Confidence: {confidence}%**")
            answer_lines.append(f"   _{content_preview}..._\n")

        return "\n".join(answer_lines)
    else:
        return """## Answer

I couldn't find specific information about your query in the provided document context.

**Suggestions:**
- Try rephrasing your question with specific key terms
- Verify that the relevant document is loaded in IntelliRAG
- Ask broader overview questions regarding the document contents"""

def run_rag_pipeline_details(query: str, vector_store: Any, all_chunks: List[Any]) -> Dict[str, Any]:
    """Execute complete RAG pipeline and return answer + structured sources dictionary."""
    # Step 1: Query expansion/rewriting
    rewritten_query = rewrite_query(query)

    # Step 2: Retrieve candidate chunks with similarity scores
    results_with_scores = retrieve_with_scores(vector_store, rewritten_query, k=5)
    retrieved_docs = [doc for doc, score in results_with_scores]
    retrieval_scores = [score for doc, score in results_with_scores]

    # Step 3: Cross-encoder reranking
    reranked_results = rerank_documents(rewritten_query, retrieved_docs, retrieval_scores)

    # Step 4: Top 3 Selection
    top_3_results = reranked_results[:3]
    top_3_docs = [doc for doc, score in top_3_results]
    top_3_scores = [score for doc, score in top_3_results]

    # Step 5: Build context string
    context = build_context_string(top_3_docs)

    # Step 6: Generate structured answer
    raw_answer = generate_structured_answer(query, context, top_3_docs, top_3_scores)

    # Step 7: Add exchange to conversation memory
    conversation_memory.add_exchange(query, raw_answer)

    # Step 8: Build clean JSON source list for rich UI rendering
    sources_data = []
    for i, (doc, score) in enumerate(top_3_results, 1):
        meta = getattr(doc, 'metadata', {}) if hasattr(doc, 'metadata') else {}
        filename = meta.get('source', 'sample.pdf')
        if os.path.isabs(filename) or '/' in filename or '\\' in filename:
            filename = os.path.basename(filename)

        confidence_pct = min(99, max(50, int(score * 100))) if isinstance(score, float) else int(score)

        content = doc.page_content if hasattr(doc, 'page_content') else str(doc)
        sources_data.append({
            "id": i,
            "filename": filename,
            "chunk_id": meta.get('chunk_id', i),
            "confidence": confidence_pct,
            "snippet": content[:240] + "..." if len(content) > 240 else content,
            "full_content": content
        })

    return {
        "query": query,
        "rewritten_query": rewritten_query,
        "answer": raw_answer,
        "sources": sources_data,
        "reranked": CROSS_ENCODER_AVAILABLE
    }

def advanced_rag_pipeline(query: str, vector_store: Any, all_chunks: List[Any]) -> str:
    """Legacy interface: returns markdown answer string."""
    details = run_rag_pipeline_details(query, vector_store, all_chunks)
    return details["answer"]
