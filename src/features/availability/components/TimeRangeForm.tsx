import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import TimeOptions from '../../../components/TimeSelectorOptions';
import type { TimeRange } from '../types';

interface TimeRangeFormProps {
  range: TimeRange;
  selectedDays: Set<string>;
  onRangeChange: (range: TimeRange) => void;
  onAddTimeRange: () => void;
  onClear: () => void;
}

export function TimeRangeForm({
  range,
  selectedDays,
  onRangeChange,
  onAddTimeRange,
  onClear
}: TimeRangeFormProps) {
  const [showAllTimes, setShowAllTimes] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Add Time Range</h3>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-amber-600">Times are saved as Local Time</p>
          <button 
            onClick={onClear}
            className="text-blue-600 text-sm hover:text-blue-700"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <TimeOptions
          value={range.startTime}
          showAllTimes={showAllTimes}
          onToggleAllTimes={setShowAllTimes}
          label="Start Time"
          onChange={(time) => onRangeChange({ ...range, startTime: time })}
        />
        <TimeOptions
          value={range.endTime}
          showAllTimes={showAllTimes}
          label="End Time"
          onChange={(time) => onRangeChange({ ...range, endTime: time })}
          minTime={range.startTime}
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRangeChange({ ...range, capacity: Math.max(0, range.capacity - 1) })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center">{range.capacity}</span>
          <button
            onClick={() => onRangeChange({ ...range, capacity: range.capacity + 1 })}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        onClick={onAddTimeRange}
        disabled={selectedDays.size === 0}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        Add to Selected Days ({selectedDays.size})
      </button>
    </div>
  );
}