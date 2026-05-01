const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export class ClientApiError extends Error {
    code;
    details;
    status;
    constructor(message, status, code = 'UNKNOWN_ERROR', details) {
        super(message);
        this.name = 'ClientApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
async function fetchWithRetry(url, options = {}) {
    const { retries = 2, retryDelay = 1000, idempotencyKey, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers || {});
    headers.set('Content-Type', 'application/json');
    if (fetchOptions.method === 'POST') {
        headers.set('Idempotency-Key', idempotencyKey || crypto.randomUUID());
    }
    const finalOptions = {
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
                let errorData = {};
                try {
                    errorData = await response.json();
                }
                catch {
                    // No JSON body
                }
                throw new ClientApiError(errorData.error || errorData.message || 'An API error occurred', response.status, errorData.code, errorData.fields);
            }
            return response;
        }
        catch (error) {
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
    get: async (endpoint, options) => {
        const res = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
            ...options,
            method: 'GET',
        });
        return res.json();
    },
    post: async (endpoint, body, options) => {
        const res = await fetchWithRetry(`${BASE_URL}${endpoint}`, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
        return res.json();
    },
};
//# sourceMappingURL=api.js.map