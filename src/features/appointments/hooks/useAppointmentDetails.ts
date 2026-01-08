import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import type { AppointmentDetails } from '../types';

export function useAppointmentDetails(id: string) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useStore();

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get event from store
      const event = store.events.find(e => e.id === id);

      if (!event) {
        throw new Error('Appointment not found');
      }

      setAppointment({
        id: event.id,
        event_id: event.event_id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        customerName: event.customerName,
        customerAddress: event.customerAddress,
        orderId: event.orderId,
        srId: event.srId,
        bridge: event.bridge,
        notes: event.notes,
        needsFsoDispatch: event.needsFsoDispatch,
        sowDetails: event.sowDetails,
        teams_meeting_id: event.teams_meeting_id,
        teams_meeting_url: event.teams_meeting_url,
        teams_meeting_created_at: event.teams_meeting_created_at
      });
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  return {
    appointment,
    loading,
    error,
    refresh: fetchAppointment
  };
}