export interface DocumentSource {
  id: number;
  filename: string;
  chunk_id: number;
  confidence: number;
  snippet: string;
  full_content?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  rawContent?: string;
  timestamp: string;
  sources?: DocumentSource[];
  rewrittenQuery?: string;
  activeDocument?: string;
  isError?: boolean;
}

export interface HealthStatus {
  status: 'online' | 'indexing_required' | 'offline';
  ready: boolean;
  active_document: string;
  chunk_count: number;
  memory_exchanges: number;
  error?: string | null;
}

export interface DocumentItem {
  filename: string;
  size_mb: number;
  is_active: boolean;
  status: 'ready' | 'available' | 'indexing';
}

export interface ChatResponse {
  answer: string;
  raw_answer: string;
  sources: DocumentSource[];
  rewritten_query: string;
  active_document: string;
  memory_context?: string;
}

export interface UploadResponse {
  message: string;
  filename: string;
  chunk_count: number;
  ready: boolean;
}
