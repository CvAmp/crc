import type { TimeString } from '../types';

import {
  parseTimeString,
  formatTimeString,
  validateTimeRange,
  timeToSlotIndex,
  slotIndexToTime,
  addMinutesToTime,
  compareTimeStrings,
  validateTimeString,
  TimeRangeError
} from './safety';

// Rule 4: Keep functions small and focused
export const formatTime = (time: TimeString): string => {
  const { hours, minutes } = parseTimeString(time);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

// Re-export safety functions
export {
  validateTimeRange as isValidTimeRange,
  timeToSlotIndex,
  slotIndexToTime,
  addMinutesToTime,
  compareTimeStrings
};

export const generateBitmap = (startTime: string, endTime: string): number[] => {
  // Assert valid inputs
  const validStartTime = validateTimeString(startTime);
  const validEndTime = validateTimeString(endTime);

  // Validate time format
  if (!validateTimeRange(validStartTime, validEndTime)) {
    throw new TimeRangeError('Invalid time range');
  }

  // Rule 3: Static allocation
  const bitmap = [0, 0];
  const startSlot = timeToSlotIndex(validStartTime);
  const endSlot = timeToSlotIndex(validEndTime);

  for (let slot = startSlot; slot < endSlot; slot++) {
    const arrayIndex = Math.floor(slot / 32);
    const bitPosition = slot % 32;
    bitmap[arrayIndex] |= (1 << bitPosition);
  }
  
  return bitmap;
};