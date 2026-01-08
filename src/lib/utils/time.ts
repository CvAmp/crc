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
  return (hours * 2) + Math.floor(minutes / 30);
};

export const generateBitmap = (startTime: string, endTime: string): number[] => {
  const bitmap = [0, 0];
  const startSlot = timeToSlotIndex(startTime);
  const endSlot = timeToSlotIndex(endTime);
  
  for (let slot = startSlot; slot < endSlot; slot++) {
    const arrayIndex = Math.floor(slot / 32);
    const bitPosition = slot % 32;
    bitmap[arrayIndex] |= (1 << bitPosition);
  }
  
  return bitmap;
};