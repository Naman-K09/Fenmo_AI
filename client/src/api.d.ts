interface FetchOptions extends RequestInit {
    idempotencyKey?: string;
    retries?: number;
    retryDelay?: number;
}
export declare class ClientApiError extends Error {
    code: string;
    details?: Record<string, string>;
    status: number;
    constructor(message: string, status: number, code?: string, details?: Record<string, string>);
}
export declare const api: {
    get: <T>(endpoint: string, options?: FetchOptions) => Promise<{
        success: boolean;
        data: T;
        total?: string;
        count?: number;
    }>;
    post: <T>(endpoint: string, body: any, options?: FetchOptions) => Promise<{
        success: boolean;
        data: T;
    }>;
};
export {};
//# sourceMappingURL=api.d.ts.map