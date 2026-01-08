/**
 * Time Slot Management System
 * 
 * This module implements a bitmap-based time slot management system for efficient
 * scheduling and availability tracking. The day is divided into 48 half-hour slots
 * (00:00-23:59), represented using a bitmap for memory-efficient storage and fast operations.
 * 
 * Bitmap Structure:
 * - Uses an array of 2 integers (64 bits total) to represent 48 half-hour slots
 * - First integer (32 bits): slots 0-31 (00:00-15:59)
 * - Second integer (32 bits): slots 32-47 (16:00-23:59)
 * - Each bit represents a 30-minute slot (1 = available, 0 = unavailable)
 */

// Constants
export const SLOTS_PER_DAY = 48; // 48 half-hour slots in a day
export const SLOT_DURATION = 30; // 30 minutes per slot
export const BITS_PER_INTEGER = 32; // Number of bits in each integer of the bitmap array

/**
 * Converts a time string (HH:mm) to a slot index (0-47)
 * Example: "09:30" -> 19 (9 hours * 2 slots + 1 slot for 30 minutes)
 */
export function timeToSlotIndex(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 2) + Math.floor(minutes / 30);
}

/**
 * Converts a slot index (0-47) to time string (HH:mm)
 * Example: 19 -> "09:30"
 */
export function slotIndexToTime(index: number): string {
  const hours = Math.floor(index / 2);
  const minutes = (index % 2) * 30;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Creates a bitmap array representing available time slots
 * Returns an array of 2 integers where each bit represents a 30-minute slot
 * 
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Array of 2 integers representing the bitmap
 */
export function createSlotsBitmap(startTime: string, endTime: string): number[] {
  const startIndex = timeToSlotIndex(startTime);
  const endIndex = timeToSlotIndex(endTime);
  const bitmap = new Array(Math.ceil(SLOTS_PER_DAY / BITS_PER_INTEGER)).fill(0);
  
  // Set bits for each available slot
  for (let i = startIndex; i < endIndex; i++) {
    const arrayIndex = Math.floor(i / BITS_PER_INTEGER);
    const bitPosition = i % BITS_PER_INTEGER;
    bitmap[arrayIndex] |= (1 << bitPosition);
  }
  
  return bitmap;
}

/**
 * Extracts active (available) slots from a bitmap
 * 
 * @param bitmap - Array of integers representing the bitmap
 * @returns Array of slot indices that are marked as available
 */
export function getActiveSlotsFromBitmap(bitmap: number[]): number[] {
  const activeSlots: number[] = [];
  
  for (let arrayIndex = 0; arrayIndex < bitmap.length; arrayIndex++) {
    for (let bitPosition = 0; bitPosition < BITS_PER_INTEGER; bitPosition++) {
      const slotIndex = arrayIndex * BITS_PER_INTEGER + bitPosition;
      if (slotIndex >= SLOTS_PER_DAY) break;
      
      if ((bitmap[arrayIndex] & (1 << bitPosition)) !== 0) {
        activeSlots.push(slotIndex);
      }
    }
  }
  
  return activeSlots;
}

/**
 * Converts an array of slot indices to time ranges
 * Merges consecutive slots into continuous ranges
 * 
 * @param slots - Array of slot indices
 * @returns Array of time ranges with start and end times
 */
export function slotsToTimeRanges(slots: number[]): { startTime: string; endTime: string; }[] {
  const ranges: { startTime: string; endTime: string; }[] = [];
  let rangeStart: number | null = null;
  
  for (let i = 0; i <= SLOTS_PER_DAY; i++) {
    const isActive = slots.includes(i);
    
    if (isActive && rangeStart === null) {
      rangeStart = i;
    } else if (!isActive && rangeStart !== null) {
      ranges.push({
        startTime: slotIndexToTime(rangeStart),
        endTime: slotIndexToTime(i)
      });
      rangeStart = null;
    }
  }
  
  return ranges;
}

/**
 * Merges overlapping time ranges into continuous ranges
 * 
 * @param ranges - Array of time ranges to merge
 * @returns Array of merged time ranges
 */
export function mergeTimeRanges(ranges: { startTime: string; endTime: string; }[]): { startTime: string; endTime: string; }[] {
  if (ranges.length <= 1) return ranges;
  
  const sortedRanges = [...ranges].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const merged: { startTime: string; endTime: string; }[] = [sortedRanges[0]];
  
  for (let i = 1; i < sortedRanges.length; i++) {
    const current = sortedRanges[i];
    const last = merged[merged.length - 1];
    
    if (current.startTime <= last.endTime) {
      last.endTime = current.endTime > last.endTime ? current.endTime : last.endTime;
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

/**
 * Calculates the total minutes in a time range
 * 
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Total minutes in the range
 */
export function calculateRangeMinutes(startTime: string, endTime: string): number {
  const start = timeToSlotIndex(startTime);
  const end = timeToSlotIndex(endTime);
  return (end - start) * SLOT_DURATION;
}

/**
 * Checks if a time is within business hours (8 AM - 5 PM)
 * 
 * @param time - Time to check in HH:mm format
 * @returns Boolean indicating if time is within business hours
 */
export function isBusinessHours(time: string): boolean {
  const [hours] = time.split(':').map(Number);
  return hours >= 8 && hours < 17;
}

/**
 * Retrieves available time slots for a day based on bitmap and capacity
 * 
 * @param bitmap - Bitmap array representing available slots
 * @param capacity - Maximum capacity for each slot
 * @param businessHoursOnly - Whether to only return slots during business hours
 * @returns Array of available time slots with capacity information
 */
export function getAvailableTimeSlots(
  bitmap: number[],
  capacity: number,
  businessHoursOnly = true
): Array<{ startTime: string; endTime: string; capacity: number }> {
  const activeSlots = getActiveSlotsFromBitmap(bitmap);
  const slots: Array<{ startTime: string; endTime: string; capacity: number }> = [];
  
  for (const slotIndex of activeSlots) {
    const startTime = slotIndexToTime(slotIndex);
    const endTime = slotIndexToTime(slotIndex + 1);
    
    if (!businessHoursOnly || isBusinessHours(startTime)) {
      slots.push({
        startTime,
        endTime,
        capacity
      });
    }
  }
  
  return slots;
}

/**
 * Combines multiple bitmaps using bitwise operations
 * 
 * @param bitmaps - Array of bitmap arrays to combine
 * @param operation - Bitwise operation to use ('AND' or 'OR')
 * @returns Combined bitmap array
 */
export function combineBitmaps(bitmaps: number[][], operation: 'AND' | 'OR'): number[] {
  if (bitmaps.length === 0) return new Array(Math.ceil(SLOTS_PER_DAY / BITS_PER_INTEGER)).fill(0);
  
  const result = [...bitmaps[0]];
  
  for (let i = 1; i < bitmaps.length; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = operation === 'AND' 
        ? result[j] & bitmaps[i][j]
        : result[j] | bitmaps[i][j];
    }
  }
  
  return result;
}