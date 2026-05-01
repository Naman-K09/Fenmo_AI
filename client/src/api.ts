

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  idempotencyKey?: string;
  retries?: number;
  retryDelay?: number;
}

export class ClientApiError extends Error {
  public code: string;
  public details?: Record<string, string>;
  public status: number;

  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR', details?: Record<string, string>) {
    super(message);
    this.name = 'ClientApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 2, retryDelay = 1000, idempotencyKey, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  if (fetchOptions.method === 'POST') {
    headers.set('Idempotency-Key', idempotencyKey || crypto.randomUUID());
  }

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await fetch(url, finalOptions);

      // We do not retry on HTTP errors as per strict interpretation, 
      // but the prompt says "only for network errors — never retry on 4xx".
      // Let's only retry on actual fetch exceptions (network failure).
      if (!response.ok) {
        // Parse error body
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // No JSON body
        }

        throw new ClientApiError(
          errorData.error || errorData.message || 'An API error occurred',
          response.status,
          errorData.code,
          errorData.fields
        );
      }

      return response;
    } catch (error) {
      // If it's a ClientApiError, it means we got a response (like 400 or 500).
      // The prompt says "never retry on 4xx responses since those are client errors".
      // We'll throw immediately if it's a 4xx. 
      if (error instanceof ClientApiError) {
        // We only retry on network errors, not HTTP responses!
        throw error;
      }

      // It's a network error
      attempt++;
      if (attempt > retries) {
        throw error;
      }

      // Exponential backoff
      await new Promise((res) => setTimeout(res, retryDelay * attempt));
    }
  }

  throw new Error('Unreachable');
}

export const api = {
  get: async <T>(endpoint: string, options?: FetchOptions) => {
    const res = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
    });
    return res.json() as Promise<{ success: boolean; data: T; total?: string; count?: number }>;
  },
  post: async <T>(endpoint: string, body: any, options?: FetchOptions) => {
    const res = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.json() as Promise<{ success: boolean; data: T }>;
  },
};
