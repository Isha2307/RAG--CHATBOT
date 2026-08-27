# Advanced RAG Chatbot

A production-grade Retrieval-Augmented Generation (RAG) chatbot built with Python, LangChain, FAISS, and HuggingFace models with advanced features.

## ✨ Features

### Core RAG Features
- Load and process PDF documents with RecursiveCharacterTextSplitter
- Intelligent text chunking with configurable overlap
- Embeddings using HuggingFace sentence transformers
- FAISS vector database for efficient similarity search
- Max Marginal Relevance (MMR) retrieval for diversity

### Advanced Features (v2.0)
- **Query Rewriting**: Automatically expands and optimizes queries using FLAN-T5
- **Cross-Encoder Reranking**: Uses ms-marco model for superior document ranking
- **Multi-Stage Ranking**: Retrieval → Reranking → Top-3 Selection
- **Conversation Memory**: Maintains context from last 5 Q&A exchanges
- **Confidence Scores**: Displays relevance confidence (0-100%) for each source
- **Structured Answers**: Generates answers with headings, bullet points, and source attribution
- **Better Embeddings**: Upgraded to all-mpnet-base-v2 for superior semantic understanding
- **Modular Architecture**: Separate functions for retrieval, reranking, answer generation
- **Robust Fallbacks**: Graceful degradation if advanced models unavailable

## System Architecture

```
User Query
    ↓
Query Rewriting (FLAN-T5)
    ↓
Semantic Retrieval (all-mpnet-base-v2 + FAISS)
    ↓
Cross-Encoder Reranking (ms-marco-MiniLM)
    ↓
Top-3 Selection
    ↓
Context Building
    ↓
Structured Answer Generation
    ↓
Conversation Memory Storage
    ↓
Answer with Confidence Scores
```

## Requirements

- Python 3.8+
- GPU recommended (supports CPU with reduced performance)

## Setup

1. Clone or download this project.

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Place your PDF file in the `data/` folder and name it `sample.pdf` (or update the `pdf_path` in `main.py`).

4. (Optional) Create `.env` file for API keys:
   ```
   HUGGINGFACE_API_KEY=your_key_here
   ```

## Running the Chatbot

Run the main script:
```
python main.py
```

The chatbot will:
1. Load and process your PDF
2. Create embeddings and vector index
3. Display available features
4. Enter interactive query mode

### Interactive Commands

- **Ask questions**: Type your question and press Enter
- **View history**: Type `history` to see previous 5 Q&A pairs
- **Clear memory**: Type `clear` to reset conversation memory
- **Exit**: Type `quit` to exit the application

## Example Usage

```
$ python main.py

Loading and processing the PDF...
PDF split into 18 chunks.
Creating embeddings and FAISS vector store with all-mpnet-base-v2 model...
Vector store created successfully.

==========================================
Advanced RAG Pipeline Ready!
==========================================

Features enabled:
✓ Query rewriting for better search
✓ Cross-encoder reranking for relevance
✓ Similarity score display
✓ Conversation memory (last 5 exchanges)
✓ Structured answers with bullet points

Commands:
  'quit' - Exit the application
  'history' - View conversation history
  'clear' - Clear conversation memory

Enter your question: What is DBMS?

Processing your query with advanced RAG pipeline...

## Answer

**Key Information:**
- Database Management System (DBMS) is software designed to manage databases
- It provides an interface for users and applications to interact with stored data
- A DBMS handles data storage, retrieval, and manipulation while ensuring data integrity

**Source Documents with Confidence Scores:**

1. **Confidence: 89%**
   Content preview...

2. **Confidence: 82%**
   Content preview...

3. **Confidence: 75%**
   Content preview...
```

## Project Structure

```
RAG/
├── main.py                          # Main application with advanced RAG pipeline
├── requirements.txt                 # Python dependencies
├── README.md                        # This file
├── ADVANCED_FEATURES_SUMMARY.md    # Detailed feature documentation
├── test_advanced_features.py        # Feature testing script
├── test_rag.py                      # Legacy test script
├── data/
│   └── sample.pdf                   # Your PDF document
├── .env                             # Environment variables (optional)
└── .venv/                           # Virtual environment
```

## Key Functions

### Main Pipeline
- `advanced_rag_pipeline()` - Orchestrates the complete RAG workflow
- `rewrite_query()` - Optimizes queries for better retrieval
- `retrieve_with_scores()` - Retrieves documents with confidence scores
- `rerank_documents()` - Reranks using cross-encoder model
- `generate_structured_answer()` - Generates formatted answers

### Supporting Functions
- `load_and_split_pdf()` - PDF loading and chunking
- `create_vector_store()` - Creates FAISS index with embeddings
- `get_top_chunks()` - Retrieves chunks with MMR
- `build_context_string()` - Combines chunks into context

### Memory Management
- `ConversationMemory` - Stores conversation history
- `conversation_memory.add_exchange()` - Store Q&A pair
- `conversation_memory.get_context()` - Retrieve history
- `conversation_memory.clear()` - Reset memory

## Performance

| Component | Time | Notes |
|-----------|------|-------|
| Query Rewriting | 0.5-1s | Runs once per query |
| Retrieval | 0.1-0.3s | FAISS similarity search |
| Reranking | 1-2s | Cross-encoder scoring |
| Answer Generation | 0.2-0.5s | Text extraction & formatting |
| **Total** | **2-4s** | End-to-end per query |

## Fallback Behavior

If advanced features are unavailable:

- Query Rewriting fails → Uses original query
- Cross-Encoder Reranking fails → Uses retrieval scores
- Advanced Models fail → Uses mock implementations
- All fallbacks preserve functionality

The chatbot continues operating at reduced capability rather than failing completely.

## Configuration

Edit `main.py` to customize:

```python
# Embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# Conversation history size
conversation_memory = ConversationMemory(max_history=5)

# Retrieval parameters
retrieve_with_scores(vector_store, query, k=5)  # k=5 for retrieval
rerank_documents(query, documents, scores)      # Top-3 after reranking

# Chunk settings
load_and_split_pdf(pdf_path, chunk_size=1000, chunk_overlap=100)
```

## Testing

Run the comprehensive test suite:
```
python test_advanced_features.py
```

Tests individual components:
1. Query Rewriting
2. Retrieval with Scores
3. Document Reranking
4. Conversation Memory
5. Structured Answer Generation
6. Full Pipeline Integration

## Monitoring

Check feature availability:
- `USE_REAL_COMPONENTS` - Real RAG components available
- `CROSS_ENCODER_AVAILABLE` - Cross-encoder model loaded
- `QUERY_REWRITER_AVAILABLE` - Query rewriter available

All features print status messages during startup.

## Troubleshooting

### "ImportError: transformers" 
```bash
pip install transformers torch sentence-transformers
```

### "Cross-encoder not available"
- Normal for first run (downloads 60MB model)
- Graceful fallback to retrieval scores
- Check internet connection

### "Query rewriter not available"
- FLAN-T5 model downloads on first use
- Falls back to original query if unavailable
- Requires ~1GB RAM

### Slow startup
- First-run downloads models (~1-2GB total)
- Subsequent runs are fast (cached locally)
- Consider running on GPU for speed

## Performance Tuning

### For Speed (CPU)
```python
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
retrieve_with_scores(vector_store, query, k=3)  # Fewer docs
conversation_memory = ConversationMemory(max_history=2)
```

### For Quality (GPU)
```python
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
retrieve_with_scores(vector_store, query, k=10)  # More candidates
# Cross-encoder reranking automatically enables
```

## Dependencies

All dependencies in `requirements.txt`:

- `langchain` - RAG framework
- `langchain-community` - Additional RAG components
- `langchain-text-splitters` - Text chunking
- `langchain-huggingface` - HuggingFace integration
- `faiss-cpu` - Vector database
- `sentence-transformers` - Embeddings and cross-encoder
- `transformers` - Query rewriting models
- `pypdf` - PDF loading
- `python-dotenv` - Environment variables

## Documentation

- `ADVANCED_FEATURES_SUMMARY.md` - Detailed feature explanations
- This README - Usage and setup guide
- File docstrings - Implementation details
- `test_advanced_features.py` - Usage examples

## Future Enhancements

- Persistent conversation storage (database)
- Multi-document support
- Custom fine-tuned models
- Streaming answer generation
- Web UI with Gradio/Streamlit
- API deployment (FastAPI)
- Relevance feedback loop

## License

MIT License - Feel free to use and modify

## Support & Contribution

For issues or suggestions, check the code comments and feature documentation in `ADVANCED_FEATURES_SUMMARY.md`.


## Customization

- Adjust chunk size and overlap in `pdf_loader.py`
- Change the number of retrieved chunks in `chatbot.py`
- Modify the LLM model or temperature in `chatbot.py`