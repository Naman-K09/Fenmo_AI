import { useRef, useCallback } from 'react';
export function useIdempotentSubmit() {
    const idempotencyKeyRef = useRef(null);
    const getKey = useCallback(() => {
        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = crypto.randomUUID();
        }
        return idempotencyKeyRef.current;
    }, []);
    const resetKey = useCallback(() => {
        idempotencyKeyRef.current = null;
    }, []);
    return { getKey, resetKey };
}
//# sourceMappingURL=useIdempotentSubmit.js.map