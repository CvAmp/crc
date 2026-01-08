import { useState } from 'react';
import { useStore } from '../../../store';
import type { Acceleration } from '../types';

interface UseAccelerationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useAccelerationForm({ onSuccess, onError }: UseAccelerationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useStore();

  const handleSubmit = async (data: Partial<Acceleration>) => {
    try {
      setLoading(true);
      setError(null);

      store.addAcceleration(data);

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit acceleration';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSubmit
  };
}