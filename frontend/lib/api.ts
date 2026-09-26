import { ChatResponse, HealthStatus, DocumentItem, UploadResponse } from './types';

// Sanitize base URL by removing any trailing slashes
const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return envUrl.replace(/\/+$/, '');
};

const API_BASE_URL = getApiBaseUrl();

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Fallback if response is not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await handleResponse<HealthStatus>(res);
  } catch (err: any) {
    // Attempt fallback to legacy /health route if /api/health fails on older backend deployments
    try {
      const fallbackRes = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      return await handleResponse<HealthStatus>(fallbackRes);
    } catch {
      return {
        status: 'offline',
        ready: false,
        active_document: 'None',
        chunk_count: 0,
        memory_exchanges: 0,
        error: err.message || `Backend API unreachable at ${API_BASE_URL}`
      };
    }
  }
}

export async function fetchDocuments(): Promise<{ active_document: string; documents: DocumentItem[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await handleResponse(res);
  } catch {
    const fallbackRes = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return handleResponse(fallbackRes);
  }
}

export async function selectDocument(filename: string): Promise<{ message: string; filename: string; chunk_count: number }> {
  const res = await fetch(`${API_BASE_URL}/api/select_document?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse(res);
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    return await handleResponse<UploadResponse>(res);
  } catch (err: any) {
    // Fallback to legacy /upload route if deployed on an older backend instance
    const fallbackRes = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse<UploadResponse>(fallbackRes);
  }
}

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return await handleResponse<ChatResponse>(res);
  } catch (err: any) {
    // Fallback to legacy /chat route if deployed on older backend instance
    const fallbackRes = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await handleResponse<any>(fallbackRes);
    return {
      answer: data.answer || data.response || 'No answer generated.',
      raw_answer: data.raw_answer || data.answer || '',
      sources: data.sources || [],
      rewritten_query: data.rewritten_query || query,
      active_document: data.active_document || 'sample.pdf'
    };
  }
}

export async function clearChatHistory(): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await handleResponse(res);
  } catch {
    return { message: 'History cleared locally' };
  }
}
