import { useState, useCallback } from 'react';
import { formatError } from '../utils/error';

interface UseAsyncOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: UseAsyncOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: Parameters<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn(...args);
      options.onSuccess?.();
      return result;
    } catch (err) {
      const message = formatError(err);
      setError(message);
      options.onError?.(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, options]);

  return {
    loading,
    error,
    execute
  };
}