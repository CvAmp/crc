import React, { useState, useEffect } from 'react';
import { Clock, Minus, Plus } from 'lucide-react';
import TimeOptions from '../../../components/TimeSelectorOptions';
import { days } from '../constants';
import { formatTime } from '../utils/time'; 
import type { WeekSchedule, TimeRange, Team } from '../types';
import { getCapacitySegments } from '../utils/capacity';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { useTeamEngineers } from '../hooks/useTeamEngineers';

interface WeeklyScheduleProps {
  schedule: WeekSchedule;
  setSchedule: (schedule: WeekSchedule) => void;
  selectedDays: Set<keyof WeekSchedule>;
  onDaySelect: (day: keyof WeekSchedule) => void;
  onRemoveTimeRange: (day: keyof WeekSchedule, index: number) => void;
  newTimeRange: TimeRange;
  onNewTimeRangeChange: (range: TimeRange) => void;
  onAddTimeRange: () => void;
  onClearTimeRange: () => void;
  teams: Team[];
  selectedTeam: string;
  onTeamChange: (teamId: string) => void;
}

export function WeeklySchedule({
  schedule,
  setSchedule,
  selectedDays,
  onDaySelect,
  onRemoveTimeRange,
  newTimeRange,
  onNewTimeRangeChange,
  onAddTimeRange,
  onClearTimeRange,
  teams,
  selectedTeam,
  onTeamChange
}: WeeklyScheduleProps) {
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<string>('');
  const { engineers, loading: loadingEngineers } = useTeamEngineers(selectedTeam);
  
  // Track which engineers actually have scheduled time ranges
  const [engineersWithSchedules, setEngineersWithSchedules] = useState<Set<string>>(new Set());
  
  // Update the list of engineers who have scheduled time ranges
  useEffect(() => {
    if (!selectedTeam) return;
    
    const engineersWithSlots = new Set<string>();
    
    // Go through all days and ranges to find engineers with schedules
    Object.values(schedule).forEach(daySchedule => {
      daySchedule.ranges.forEach(range => {
        if (range.teamId === selectedTeam && range.engineerId) {
          engineersWithSlots.add(range.engineerId);
        }
      });
    });
    
    setEngineersWithSchedules(engineersWithSlots);
  }, [schedule, selectedTeam]);

  // For the purposes of this demo, assign placeholder engineerIds
  // In a real implementation, this would be retrieved from the database
  useEffect(() => {
    if (!selectedTeam || engineers.length === 0) return;
    
    const shaniId = engineers.find(e => e.email.toLowerCase().includes('shani'))?.id || engineers[0]?.id;
    const russId = engineers.find(e => e.email.toLowerCase().includes('russ'))?.id || engineers[1]?.id;
    
    if (!shaniId || !russId) return;
    
    setSchedule(prev => {
      const newSchedule = {...prev};
      days.forEach(({ key }) => {
        newSchedule[key].ranges = newSchedule[key].ranges.map(range => {
          if (range.startTime === '08:00' && range.endTime === '17:00') {
            return {...range, engineerId: shaniId};
          }
          if (range.startTime === '09:00' && range.endTime === '18:00') {
            return {...range, engineerId: russId};
          }
          return range;
        });
      });
      return newSchedule;
    });
  }, [selectedTeam, engineers, setSchedule]);

  const renderScheduleGrid = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Base Schedule Column */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Base Schedule</h3>
          {days.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
              <div className="space-y-1">
                {schedule[key].ranges
                  .filter(range => !selectedTeam || range.teamId === selectedTeam)
                  .filter(range => !selectedEngineer || range.engineerId === selectedEngineer)
                  .map((range, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-1.5 rounded-lg border-l-4 border-blue-200 bg-gray-50 ${
                      selectedTeam ? 'hover:bg-blue-50 transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs">
                        {formatTime(range.startTime)} - {formatTime(range.endTime)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          ({range.capacity})
                        </span>
                        {selectedTeam && (
                          <div className="flex -space-x-2">
                            {engineers
                              .filter(engineer => {
                                // Always show the engineer assigned to this range
                                // If no specific range assignment, don't show any avatar
                                return range.engineerId === engineer.id;
                              })
                              .map(engineer => (
                                <div
                                  key={engineer.id}
                                  className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                                  title={engineer.email}
                                >
                                  <span className="text-xs text-blue-800 font-medium">
                                    {engineer.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedTeam && (
                      <div className="flex items-center">
                        <button
                          onClick={() => onRemoveTimeRange(key, index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Total Capacity Column */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 h-5">Total Capacity</h3>
          {days.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="text-xs font-medium text-gray-700 h-4">{label}</div>
              <div className="space-y-1">
                {getCapacitySegments(
                  schedule[key].ranges
                    .filter(range => !selectedTeam || range.teamId === selectedTeam)
                    .filter(range => !selectedEngineer || range.engineerId === selectedEngineer)
                ).map((segment, index) => {
                  // Find all ranges that contribute to this segment
                  const contributingRanges = schedule[key].ranges.filter(range => 
                    (!selectedTeam || range.teamId === selectedTeam) && 
                    (!selectedEngineer || range.engineerId === selectedEngineer) &&
                    range.startTime <= segment.startTime && 
                    range.endTime >= segment.endTime
                  );
                  
                  // Get unique engineer IDs from contributing ranges
                  const uniqueEngineers = new Set<string>();
                  contributingRanges.forEach(range => {
                    if (range.engineerId) {
                      uniqueEngineers.add(range.engineerId);
                    }
                  });
                  
                  return (
                    <div key={`segment-${index}`} className="flex items-center justify-between bg-green-50 p-1.5 rounded-lg border-l-4 border-green-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-green-600" />
                        <span className="text-xs">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                        {selectedTeam && (
                          <div className="flex -space-x-2">
                            {engineers
                              .filter(engineer => {
                                // Only show engineers who contribute to this time slot
                                return uniqueEngineers.has(engineer.id);
                              })
                              .map(engineer => (
                                <div
                                  key={engineer.id}
                                  className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center"
                                  title={engineer.email}
                                >
                                  <span className="text-xs text-green-800 font-medium">
                                    {engineer.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                        {segment.capacity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Team Selection</h2>
        <Select
          value={selectedTeam}
          onChange={(e) => onTeamChange(e.target.value)}
          options={[
            { value: '', label: 'Select a team to manage capacity' },
            ...teams.map(team => ({
              value: team.id,
              label: team.name
            }))
          ]}
          className="w-full"
        />
      </div>
      
      {selectedTeam && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Engineer Selection</h2>
          <Select
            value={selectedEngineer}
            onChange={(e) => setSelectedEngineer(e.target.value)}
            options={[
              { value: '', label: 'Select an engineer' },
              ...engineers.map(engineer => ({
                value: engineer.id,
                label: engineer.email
              }))
            ]}
            className="w-full"
          />
        </div>
      )}

      {selectedTeam ? (
        <>
          <div className="grid grid-cols-7 gap-2">
            {days.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onDaySelect(key)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  selectedDays.has(key)
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-medium">{label[0]}</div>
                <div className="text-xs mt-1">
                  {schedule[key].ranges.filter(range => !selectedTeam || range.teamId === selectedTeam).length || '-'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium">Add Time Range</h3>
                  <span className="text-sm text-gray-600">
                    {teams.find(t => t.id === selectedTeam)?.name}
                    {selectedEngineer && ` - ${engineers.find(e => e.id === selectedEngineer)?.email}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllTimes(!showAllTimes)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                    showAllTimes 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{showAllTimes ? 'Show Business Hours' : 'Show All Times'}</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-amber-600">Times are saved as Local Time</p>
                <button 
                  onClick={onClearTimeRange}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TimeOptions
                value={newTimeRange.startTime}
                showAllTimes={showAllTimes}
                hideToggle
                label="Start Time"
                onChange={(time) => onNewTimeRangeChange({ 
                  ...newTimeRange, 
                  startTime: time,
                  engineerId: selectedEngineer || undefined 
                })}
              />
              <TimeOptions
                value={newTimeRange.endTime}
                showAllTimes={showAllTimes}
                hideToggle
                label="End Time"
                onChange={(time) => onNewTimeRangeChange({ 
                  ...newTimeRange, 
                  endTime: time,
                  engineerId: selectedEngineer || undefined 
                })}
                minTime={newTimeRange.startTime}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNewTimeRangeChange({ ...newTimeRange, capacity: Math.max(0, newTimeRange.capacity - 1) })}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{newTimeRange.capacity}</span>
                <button
                  onClick={() => onNewTimeRangeChange({ ...newTimeRange, capacity: newTimeRange.capacity + 1 })}
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

          <div className="mt-8">
            {renderScheduleGrid()}
          </div>
        </>
      ) : (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All Teams Schedule</h3>
            {renderScheduleGrid()}
          </div>
        </Card>
      )}
    </div>
  );
}