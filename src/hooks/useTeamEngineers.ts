import { useState, useEffect } from 'react';
import { useStore } from '../store';

interface Engineer {
  id: string;
  email: string;
  role: string;
}

export function useTeamEngineers(teamId: string | null) {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useStore();

  useEffect(() => {
    if (!teamId) {
      setEngineers([]);
      setLoading(false);
      return;
    }

    // Filter engineers from store
    const teamEngineers = store.users.filter(user => 
      user.teamId === teamId && 
      (user.role === 'ENGINEER' || user.role === 'ENGINEER_MANAGER')
    );
    setEngineers(teamEngineers);
    setLoading(false);
  }, [teamId, store.users]);

  return {
    engineers,
    loading,
    error
  };
}