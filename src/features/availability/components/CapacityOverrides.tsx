import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';
import TimeOptions from '../../../components/TimeSelectorOptions';
import type { TimeRange, Team } from '../types';

interface CapacityOverridesProps {
  overrides: Array<{
    date: string;
    ranges: TimeRange[];
    teamId?: string;
  }>;
  newOverride: TimeRange;
  onNewOverrideChange: (range: TimeRange) => void;
  onAddOverride: () => void;
  onRemoveOverride: (date: string, index: number) => void;
  teams: Team[];
  selectedTeam: string;
}

export function CapacityOverrides({
  overrides,
  newOverride,
  onNewOverrideChange,
  onAddOverride,
  onRemoveOverride,
  teams,
  selectedTeam
}: CapacityOverridesProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

  if (!selectedTeam) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a team to manage capacity overrides
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <TimeOptions 
        label="Start Time" 
        value={newOverride.startTime}
        showAllTimes={newOverride.showAllTimes}
        onToggleAllTimes={(show) => onNewOverrideChange({
          ...newOverride,
          showAllTimes: show
        })}
        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        onChange={(time) => onNewOverrideChange({
          ...newOverride,
          startTime: time,
          endTime: time > newOverride.endTime ? time : newOverride.endTime
        })}
      />
      <TimeOptions
        label="End Time"
        value={newOverride.endTime}
        showAllTimes={newOverride.showAllTimes}
        hideToggle
        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        onChange={(time) => onNewOverrideChange({ ...newOverride, endTime: time })}
        minTime={newOverride.startTime}
      />
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
        <input
          type="number"
          min="0"
          value={newOverride.capacity}
          onChange={(e) => onNewOverrideChange({ ...newOverride, capacity: Number(e.target.value) })}
          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button 
        onClick={() => {
          onAddOverride();
          setSelectedDate(new Date().toLocaleDateString('en-CA'));
        }}
        className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Capacity Override
      </button>
      
      {/* List of Date Overrides */}
      {overrides.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Overrides</h3>
          {overrides
            .filter(override => override.teamId === selectedTeam)
            .map((override, dateIndex) => (
            <div key={`${override.date}-${dateIndex}`} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {new Date(override.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <button
                  onClick={() => onRemoveOverride(override.date, dateIndex)}
                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-blue-600" />
                </button>
              </div>
              <div className="space-y-1">
                {override.ranges.map((range, rangeIndex) => (
                  <div key={`${override.date}-${rangeIndex}-${range.startTime}-${range.endTime}`} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{range.startTime} - {range.endTime}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {range.capacity} slots
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}