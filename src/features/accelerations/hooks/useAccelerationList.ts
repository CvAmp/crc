import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import type { Acceleration } from '../types';

export function useAccelerationList() {
  const [accelerations, setAccelerations] = useState<Acceleration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useStore();

  useEffect(() => {
    fetchAccelerations();
  }, []);

  const fetchAccelerations = async () => {
    try {
      setLoading(true);
      
      const accelerations = store.accelerations.map(acc => ({
        ...acc,
        product_type_name: store.productTypes.find(pt => pt.id === acc.product_type)?.name
      }));
      setAccelerations(accelerations);
    } catch (err) {
      console.error('Error fetching accelerations:', err);
      setError('Failed to load accelerations');
    } finally {
      setLoading(false);
    }
  };

  return {
    accelerations,
    loading,
    error,
    refresh: fetchAccelerations
  };
}