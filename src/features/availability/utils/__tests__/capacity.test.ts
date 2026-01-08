import { describe, it, expect } from 'vitest';
import { getCapacitySegments } from '../capacity';
import type { TimeRange } from '../../types';

describe('getCapacitySegments', () => {
  it('combines overlapping time ranges', () => {
    const ranges: TimeRange[] = [
      { startTime: '09:00', endTime: '10:00', capacity: 2 },
      { startTime: '09:00', endTime: '10:00', capacity: 1 },
      { startTime: '10:00', endTime: '11:00', capacity: 3 }
    ];

    const segments = getCapacitySegments(ranges);
    
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({
      startTime: '09:00',
      endTime: '10:00',
      capacity: 3
    });
    expect(segments[1]).toEqual({
      startTime: '10:00',
      endTime: '11:00',
      capacity: 3
    });
  });

  it('handles non-overlapping ranges', () => {
    const ranges: TimeRange[] = [
      { startTime: '09:00', endTime: '10:00', capacity: 2 },
      { startTime: '11:00', endTime: '12:00', capacity: 1 }
    ];

    const segments = getCapacitySegments(ranges);
    
    expect(segments).toHaveLength(2);
    expect(segments).toEqual([
      { startTime: '09:00', endTime: '10:00', capacity: 2 },
      { startTime: '11:00', endTime: '12:00', capacity: 1 }
    ]);
  });

  it('handles empty input', () => {
    const segments = getCapacitySegments([]);
    expect(segments).toHaveLength(0);
  });

  it('maintains order of segments', () => {
    const ranges: TimeRange[] = [
      { startTime: '11:00', endTime: '12:00', capacity: 1 },
      { startTime: '09:00', endTime: '10:00', capacity: 2 },
      { startTime: '10:00', endTime: '11:00', capacity: 3 }
    ];

    const segments = getCapacitySegments(ranges);
    
    expect(segments).toHaveLength(3);
    expect(segments[0].startTime).toBe('09:00');
    expect(segments[1].startTime).toBe('10:00');
    expect(segments[2].startTime).toBe('11:00');
  });
});