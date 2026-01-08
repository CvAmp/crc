import type { TimeRange } from '../types';

export const getCapacitySegments = (ranges: TimeRange[]) => {
  const sortedRanges = ranges.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const segments: Array<{startTime: string, endTime: string, capacity: number}> = [];

  sortedRanges.forEach(range => {
    const existingSegment = segments.find(
      segment => segment.startTime === range.startTime && segment.endTime === range.endTime
    );

    if (existingSegment) {
      existingSegment.capacity += range.capacity;
    } else {
      segments.push({
        startTime: range.startTime,
        endTime: range.endTime,
        capacity: range.capacity
      });
    }
  });

  return segments;
};