'use server';

import { useStore } from '../store';
import type { BlockedDate, TimeRange } from '../features/availability/types';

export async function saveScheduleAction(slots: Array<{
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  totalSlots: number;
  teamId?: string;
  slotsBitmap: number[];
}>) {
  const store = useStore.getState();

  try {
    store.setStandardSlots(slots);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save schedule' 
    };
  }
}

export async function addBlockedDateAction(date: BlockedDate) {
  const store = useStore.getState();

  try {
    store.addBlockedDate(date);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add blocked date' 
    };
  }
}

export async function removeBlockedDateAction(date: string) {
  const store = useStore.getState();

  try {
    store.removeBlockedDate(date);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove blocked date' 
    };
  }
}

export async function addCapacityOverrideAction(override: {
  date: string;
  ranges: TimeRange[];
  teamId?: string;
}) {
  const store = useStore.getState();

  try {
    store.addCapacityOverride(override);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add capacity override' 
    };
  }
}

export async function removeCapacityOverrideAction(date: string, index: number) {
  const store = useStore.getState();

  try {
    store.removeCapacityOverride(date, index);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove capacity override' 
    };
  }
}