import {
  Hour,
  Minute,
  TimeString,
  SlotIndex,
  TimeComponents,
  TimeBitmap,
  TimeFormatError,
  TimeRangeError,
  SlotIndexError,
  TIME_BOUNDS,
  isHour,
  isMinute,
  isTimeString,
  isSlotIndex
} from '../types';

// Rule 4: Small, focused validation functions
export const validateHour = (hour: number): Hour => {
  if (!isHour(hour)) {
    throw new TimeFormatError(`Hour must be between ${TIME_BOUNDS.HOURS.MIN} and ${TIME_BOUNDS.HOURS.MAX}`);
  }
  return hour;
};

export const validateMinute = (minute: number): Minute => {
  if (!isMinute(minute)) {
    throw new TimeFormatError(`Minute must be between ${TIME_BOUNDS.MINUTES.MIN} and ${TIME_BOUNDS.MINUTES.MAX}`);
  }
  return minute as Minute;
};

export const validateTimeString = (time: string): TimeString => {
  if (!isTimeString(time)) {
    throw new TimeFormatError('Invalid time format. Expected HH:mm');
  }
  return time as TimeString;
};

// Rule 5: Runtime assertions for time parsing
export const parseTimeString = (time: TimeString): TimeComponents => {
  const [hours, minutes] = time.split(':').map(Number);
  return {
    hours: validateHour(hours),
    minutes: validateMinute(minutes)
  };
};

// Rule 3: Static allocation for time formatting
export const formatTimeString = (hours: Hour, minutes: Minute): TimeString => {
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return validateTimeString(timeStr);
};

// Rule 2: Fixed bounds for time slot calculations
export const timeToSlotIndex = (time: TimeString): SlotIndex => {
  const { hours, minutes } = parseTimeString(time);
  const slotIndex = (hours * 2) + Math.floor(minutes / 30);
  
  if (!isSlotIndex(slotIndex)) {
    throw new SlotIndexError(`Slot index must be between ${TIME_BOUNDS.SLOTS.MIN} and ${TIME_BOUNDS.SLOTS.MAX}`);
  }
  
  return slotIndex as SlotIndex;
};

export const slotIndexToTime = (index: SlotIndex): TimeString => {
  if (!isSlotIndex(index)) {
    throw new SlotIndexError(`Invalid slot index: ${index}`);
  }

  const hours = Math.floor(index / 2);
  const minutes = (index % 2) * 30;
  return formatTimeString(validateHour(hours), validateMinute(minutes));
};

// Rule 1: Simple control flow for time range validation
export const validateTimeRange = (
  startTime: TimeString,
  endTime: TimeString,
  allowOvernight = false
): boolean => {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  // Convert to minutes for easier comparison
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (allowOvernight) {
    // For overnight ranges, start time must be after 23:00 and end time before 00:30
    if (startTime > endTime) {
      return startMinutes >= 23 * 60 && endMinutes <= 30;
    }
  }

  return startMinutes < endMinutes;
};

// Rule 3: Static allocation for time arithmetic
export const addMinutesToTime = (time: TimeString, minutes: number): TimeString => {
  const { hours, minutes: mins } = parseTimeString(time);
  
  let totalMinutes = hours * 60 + mins + minutes;
  
  // Normalize to 24-hour range
  totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  
  const newHours = validateHour(Math.floor(totalMinutes / 60));
  const newMinutes = validateMinute(totalMinutes % 60);
  
  return formatTimeString(newHours, newMinutes);
};

// Rule 4: Small, focused utility for time comparison
export const compareTimeStrings = (time1: TimeString, time2: TimeString): number => {
  const t1 = parseTimeString(time1);
  const t2 = parseTimeString(time2);

  const minutes1 = t1.hours * 60 + t1.minutes;
  const minutes2 = t2.hours * 60 + t2.minutes;

  return minutes1 - minutes2;
};