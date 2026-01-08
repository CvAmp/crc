import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { formatTime, isValidTimeRange } from '../features/time/utils';
import { getCapacitySegments } from '../features/availability/utils/capacity';
import { Alert } from './ui/Alert';
import { LoadingSpinner } from './ui/LoadingSpinner';
import TimeOptions from './TimeSelectorOptions';

interface TimeRange {
  startTime: string;
  endTime: string;
  capacity: number;
  id?: string;
}

interface DaySchedule {
  enabled: boolean;
  ranges: TimeRange[];
}

type WeekSchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
};

const dayToNumber = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export function CapacityManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const store = useStore();
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, ranges: [] },
    tuesday: { enabled: true, ranges: [] },
    wednesday: { enabled: true, ranges: [] },
    thursday: { enabled: true, ranges: [] },
    friday: { enabled: true, ranges: [] },
    saturday: { enabled: true, ranges: [] },
    sunday: { enabled: true, ranges: [] }
  });

  const [newRange, setNewRange] = useState<TimeRange>({
    startTime: '08:00',
    endTime: '17:00',
    capacity: 2
  });

  const [selectedDays, setSelectedDays] = useState<Set<keyof WeekSchedule>>(new Set(['monday']));
  
  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSaveLayout = async () => {
    try {
      setError(null);
      // Convert schedule to standard slots format
      const slots = Object.entries(schedule).flatMap(([day, daySchedule]) =>
        daySchedule.ranges.map(range => ({
          id: range.id || generateId(),
          day_of_week: dayToNumber[day as keyof WeekSchedule],
          start_time: `${range.startTime}:00`,
          end_time: `${range.endTime}:00`,
          total_slots: range.capacity,
          slotsBitmap: generateBitmap(range.startTime, range.endTime)
        }))
      );

      store.setStandardSlots(slots);
      setSuccess('Schedule saved successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Failed to save schedule. Please try again.');
      // Refetch to ensure consistency
      await fetchAvailability();
    }
  };

  // Helper function to generate bitmap
  const generateBitmap = (startTime: string, endTime: string): number[] => {
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

  // Helper function to convert time to slot index
  const timeToSlotIndex = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 2) + Math.floor(minutes / 30);
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // Create a fresh schedule with empty ranges
      const newSchedule: WeekSchedule = {
        monday: { enabled: true, ranges: [] },
        tuesday: { enabled: true, ranges: [] },
        wednesday: { enabled: true, ranges: [] },
        thursday: { enabled: true, ranges: [] },
        friday: { enabled: true, ranges: [] },
        saturday: { enabled: true, ranges: [] },
        sunday: { enabled: true, ranges: [] }
      };

      // Get schedule from store
      const slots = store.standardSlots;
      slots.forEach(slot => {
        const day = Object.entries(dayToNumber)
          .find(([_, num]) => num === slot.dayOfWeek)?.[0] as keyof WeekSchedule;
        
        if (day && record.start_time && record.end_time) {
          newSchedule[day].ranges.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.totalSlots,
            id: slot.id
          });
        }
      });

      setSchedule(newSchedule);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeRangeToDay = (day: keyof WeekSchedule, range: TimeRange) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, range]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveTimeRangeFromDay = (day: keyof WeekSchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter((_, i) => i !== index)
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddTimeRange = async () => {
    if (!isValidTimeRange(newRange.startTime, newRange.endTime)) {
      setError('Invalid time range. End time must be after start time.');
      return;
    }

    selectedDays.forEach(day => {
      handleAddTimeRangeToDay(day, { ...newRange });
    });
    
    // Reset form
    setNewRange({
      startTime: '08:00',
      endTime: '17:00',
      capacity: 2
    });
    setSelectedDays(new Set());
  };

  const handleRemoveTimeRange = (day: keyof WeekSchedule, index: number) => {
    handleRemoveTimeRangeFromDay(day, index);
  };

  const handleDiscardChanges = async () => {
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
      await fetchAvailability();
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const period = Number(hours) >= 12 ? 'PM' : 'AM';
    const hour12 = Number(hours) % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const isValidTimeRange = (startTime: string, endTime: string): boolean => {
    return startTime < endTime;
  };

  const getCapacitySegments = (ranges: TimeRange[]) => {
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

  const days: Array<{ key: keyof WeekSchedule; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Weekly Schedule</h1>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Quick Action</span>
              </button>
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 font-medium">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleDiscardChanges}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                >
                  Discard Changes
                </button>
              )}
              <button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
                className={`px-6 py-2 rounded-md font-medium flex items-center space-x-2 ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>

          {error && (
            <Alert type="error" message={error} />
          )}
          {success && (
            <Alert type="success" message={success} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Select Days</h2>
            <div className="grid grid-cols-7 gap-2">
              {days.map(({ key, label }, index) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedDays(prev => {
                      const next = new Set(prev);
                      if (next.has(key)) {
                        next.delete(key);
                      } else {
                        next.add(key);
                      }
                      return next;
                    });
                  }}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    selectedDays.has(key)
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium">{label[0]}</div>
                  <div className="text-xs mt-1">
                    {schedule[key].ranges.length || '-'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Time Range Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Add Time Range</h3>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-amber-600">Times are saved as Local Time of the Submitting User</p>
                <button 
                  onClick={() => {
                    setNewRange({
                      startTime: '08:00',
                      endTime: '17:00',
                      capacity: 2
                    });
                    setSelectedDays(new Set(['monday']));
                  }}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <TimeOptions
                  value={newRange.startTime}
                  showAllTimes={true}
                  label="Start Time"
                  onChange={(time) => setNewRange({ ...newRange, startTime: time })}
                />
              </div>
              <div>
                <TimeOptions
                  value={newRange.endTime}
                  showAllTimes={true}
                  label="End Time"
                  onChange={(time) => setNewRange({ ...newRange, endTime: time })}
                  minTime={newRange.startTime}
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNewRange(prev => ({ ...prev, capacity: Math.max(0, prev.capacity - 1) }))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{newRange.capacity}</span>
                <button
                  onClick={() => setNewRange(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleAddTimeRange}
              disabled={selectedDays.size === 0}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add to Selected Days ({selectedDays.size})
            </button>
          </div>

          {/* Time Ranges List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Base Time Ranges Column */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Base Schedule</h3>
                  <div className="space-y-3">
                    {days.map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
                        <div className="space-y-1">
                          {schedule[key].ranges.map((range, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-1.5 rounded-lg border-l-4 border-blue-200 bg-gray-50 hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs">
                                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({range.capacity})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleRemoveTimeRange(key, index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cumulative Capacity Column */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Total Capacity</h3>
                  <div className="space-y-3">
                    {days.map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
                        <div className="space-y-1">
                          {getCapacitySegments(schedule[key].ranges).map((segment, index) => (
                            <div key={`segment-${index}`} className="flex items-center justify-between bg-green-50 p-1.5 rounded-lg border-l-4 border-green-200">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-green-600" />
                                <span className="text-xs">
                                  {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                {segment.capacity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Override Section */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-sm font-semibold mb-2">Capacity Overrides</h2>
            {/* Capacity override content */}
          </div>
        </div>
      </div>
    </div>
  );
}