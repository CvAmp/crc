import type { TimeRange } from '../types';

export const getCapacitySegments = (ranges: TimeRange[]) => {
  if (ranges.length === 0) return [];

  // Get all unique time points (start and end times)
  const timePoints = new Set<string>();
  ranges.forEach(range => {
    timePoints.add(range.startTime);
    timePoints.add(range.endTime);
  });

  // Sort time points chronologically
  const sortedTimePoints = Array.from(timePoints).sort();

  // Create segments between consecutive time points
  const segments: Array<{startTime: string, endTime: string, capacity: number}> = [];
  
  for (let i = 0; i < sortedTimePoints.length - 1; i++) {
    const segmentStart = sortedTimePoints[i];
    const segmentEnd = sortedTimePoints[i + 1];
    
    // Calculate total capacity for this segment
    const capacity = ranges.reduce((total, range) => {
      // Check if range overlaps with this segment
      // A range overlaps if its start time is <= segment start AND its end time is >= segment end
      if (range.startTime <= segmentStart && range.endTime >= segmentEnd) {
        return total + range.capacity;
      }
      return total;
    }, 0);
    
    // Only add segments with non-zero capacity
    if (capacity > 0) {
      segments.push({ 
        startTime: segmentStart, 
        endTime: segmentEnd, 
        capacity 
      });
    }
  }

  return segments;
};