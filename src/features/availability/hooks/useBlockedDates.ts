import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import type { BlockedDate } from '../types';

const DEFAULT_BLOCKED_DATE: BlockedDate = {
  date: new Date().toLocaleDateString('en-CA'),
  reason: '',
  applyToAllTeams: false,
  teamId: undefined
};

export function useBlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useStore();

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      setBlockedDates(store.blockedDates);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      setError('Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  };

  const addBlockedDate = async (date: BlockedDate) => {
    if (!date.date) {
      setError('Please select a date');
      return;
    }

    // Validate that either teamId is set or applyToAllTeams is true
    if (!date.applyToAllTeams && !date.teamId) {
      setError('Please select a team or apply to all teams');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Check if date is already blocked
      const existingDate = blockedDates.find(d => d.date === date.date);
      if (existingDate) {
        setError('This date is already blocked');
        return;
      }

      store.addBlockedDate({
        date: date.date,
        reason: date.reason.trim(),
        teamId: date.applyToAllTeams ? undefined : date.teamId,
        applyToAllTeams: date.applyToAllTeams
      });

      await fetchBlockedDates();
    } catch (err) {
      console.error('Error blocking date:', err);
      setError('Failed to block date');
    } finally {
      setSaving(false);
    }
  };

  const removeBlockedDate = async (date: string) => {
    try {
      store.removeBlockedDate(date);

      await fetchBlockedDates();
    } catch (err) {
      console.error('Error removing blocked date:', err);
      setError('Failed to remove blocked date');
    }
  };

  return {
    blockedDates,
    loading,
    saving,
    error,
    defaultBlockedDate: DEFAULT_BLOCKED_DATE,
    addBlockedDate,
    removeBlockedDate
  };
}