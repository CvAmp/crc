'use server';

import { useStore } from '../store';
import type { CalendarEvent } from '../types';

export async function createEventAction(event: Omit<CalendarEvent, 'id' | 'event_id'>) {
  const store = useStore.getState();

  try {
    store.addEvent(event);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create event' 
    };
  }
}

export async function updateEventAction(id: string, updates: Partial<CalendarEvent>) {
  const store = useStore.getState();

  try {
    store.updateEvent(id, updates);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update event' 
    };
  }
}

export async function deleteEventAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeEvent(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete event' 
    };
  }
}

export async function regenerateMeetingAction(eventId: string, meetingDetails: {
  id: string;
  joinUrl: string;
  createdAt: string;
}) {
  const store = useStore.getState();

  try {
    store.updateEvent(eventId, {
      teams_meeting_id: meetingDetails.id,
      teams_meeting_url: meetingDetails.joinUrl,
      teams_meeting_created_at: meetingDetails.createdAt,
      bridge: `Microsoft Teams Meeting\nJoin URL: ${meetingDetails.joinUrl}`
    });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to regenerate meeting' 
    };
  }
}