// Time-related type definitions with strict bounds
export type Hour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 
                  12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export type Minute = 0 | 15 | 30 | 45;

// Branded types for type safety
export type TimeString = string & { __brand: 'TimeString' };
export type SlotIndex = number & { __brand: 'SlotIndex' };

// Time format constants
export const TIME_BOUNDS = {
  HOURS: {
    MIN: 0,
    MAX: 23
  },
  MINUTES: {
    MIN: 0,
    MAX: 59
  },
  SLOTS: {
    MIN: 0,
    MAX: 47 // 24 hours * 2 slots per hour - 1
  }
} as const;

// Type guards
export function isHour(value: number): value is Hour {
  return Number.isInteger(value) && value >= TIME_BOUNDS.HOURS.MIN && value <= TIME_BOUNDS.HOURS.MAX;
}

export function isMinute(value: number): value is Minute {
  return Number.isInteger(value) && value >= TIME_BOUNDS.MINUTES.MIN && value <= TIME_BOUNDS.MINUTES.MAX;
}

export function isTimeString(value: string): value is TimeString {
  return /^\d{2}:\d{2}$/.test(value) && 
         isHour(parseInt(value.split(':')[0])) && 
         isMinute(parseInt(value.split(':')[1]));
}

export function isSlotIndex(value: number): value is SlotIndex {
  return Number.isInteger(value) && 
         value >= TIME_BOUNDS.SLOTS.MIN && 
         value <= TIME_BOUNDS.SLOTS.MAX;
}

// Time-related interfaces
export interface TimeComponents {
  hours: Hour;
  minutes: Minute;
}

export interface TimeRange {
  startTime: TimeString;
  endTime: TimeString;
}

export interface TimeSlot {
  index: SlotIndex;
  startTime: TimeString;
  endTime: TimeString;
}

// Bitmap type
export type TimeBitmap = [number, number];

// Time format options
export interface TimeFormatOptions {
  use24Hour?: boolean;
  includeSeconds?: boolean;
  timeZone?: string;
}

// Error types
export class TimeFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeFormatError';
  }
}

export class TimeRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeRangeError';
  }
}

export class SlotIndexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlotIndexError';
  }
}