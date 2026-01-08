export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const hour12 = Number(hours) % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  // Allow ranges that cross midnight
  if (startTime > endTime) {
    return startTime >= '23:00' && endTime <= '00:30';
  }
  return startTime < endTime;
};

export const timeToSlotIndex = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 2) + Math.floor(minutes / 30);
};

export const generateBitmap = (startTime: string, endTime: string): number[] => {
  const bitmap = [0n, 0n]; // Use BigInt for proper bit operations
  const startSlot = timeToSlotIndex(startTime);
  const endSlot = timeToSlotIndex(endTime);
  
  // Handle ranges that cross midnight
  if (startTime > endTime) {
    // Set bits from start time to midnight
    for (let slot = startSlot; slot < 48; slot++) {
      const arrayIndex = Math.floor(slot / 32);
      const bitPosition = slot % 32;
      bitmap[arrayIndex] |= (1n << BigInt(bitPosition));
    }
    // Set bits from midnight to end time
    for (let slot = 0; slot < endSlot; slot++) {
      const arrayIndex = Math.floor(slot / 32);
      const bitPosition = slot % 32;
      bitmap[arrayIndex] |= (1n << BigInt(bitPosition));
    }
  } else {
    // Normal range within same day
    for (let slot = startSlot; slot < endSlot; slot++) {
      const arrayIndex = Math.floor(slot / 32);
      const bitPosition = slot % 32;
      bitmap[arrayIndex] |= (1n << BigInt(bitPosition));
    }
  }
  
  // Convert BigInt back to Number for database storage
  return [Number(bitmap[0]), Number(bitmap[1])];
};

// Helper function to validate bitmap values
export const validateBitmap = (bitmap: number[]): boolean => {
  if (!Array.isArray(bitmap) || bitmap.length !== 2) return false;
  return bitmap.every(value => 
    Number.isInteger(value) && 
    value >= 0 && 
    value <= Number.MAX_SAFE_INTEGER
  );
};