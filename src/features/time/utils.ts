export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const hour12 = Number(hours) % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  return startTime < endTime;
};

export const timeToSlotIndex = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Rule 2: Fixed bounds
  const MAX_SLOTS = 48; // 24 hours * 2 slots per hour
  const slotIndex = (hours * 2) + Math.floor(minutes / 30);
  
  if (slotIndex >= MAX_SLOTS) {
    throw new Error(`Slot index cannot exceed ${MAX_SLOTS - 1}`);
  }
  
  return slotIndex;
};

export const generateBitmap = (startTime: string, endTime: string): number[] => {
  // Assert valid inputs
  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    throw new Error('Start and end times must be strings');
  }

  // Rule 3: Static allocation
  const bitmap = [0, 0];

  // Validate time format
  try {
    formatTime(startTime);
    formatTime(endTime);
  } catch (err) {
    throw new Error('Invalid time format');
  }

  const startSlot = timeToSlotIndex(startTime);
  const endSlot = timeToSlotIndex(endTime);
  
  // Rule 2: Fixed bounds
  const MAX_SLOTS = 48;
  if (startSlot >= MAX_SLOTS || endSlot >= MAX_SLOTS) {
    throw new Error(`Slot index cannot exceed ${MAX_SLOTS - 1}`);
  }

  for (let slot = startSlot; slot < endSlot; slot++) {
    const arrayIndex = Math.floor(slot / 32);
    const bitPosition = slot % 32;
    bitmap[arrayIndex] |= (1 << bitPosition);
  }
  
  return bitmap;
};