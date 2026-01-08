import type { Acceleration } from '../types';

export function sortAccelerations(
  accelerations: Acceleration[],
  field: keyof Acceleration,
  direction: 'asc' | 'desc'
): Acceleration[] {
  return [...accelerations].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    const multiplier = direction === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }
    
    return ((aValue as any) - (bValue as any)) * multiplier;
  });
}