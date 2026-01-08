import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { WeeklySchedule } from '../features/availability/components/WeeklySchedule';
import { TimeRangeForm } from '../features/availability/components/TimeRangeForm';
import { CapacityOverrides } from '../features/availability/components/CapacityOverrides';
import { BlockedDates } from '../features/availability/components/BlockedDates';
import { useAvailabilitySchedule } from '../features/availability/hooks/useAvailabilitySchedule';
import { useBlockedDates } from '../features/availability/hooks/useBlockedDates';
import { useTeams } from '../features/availability/hooks/useTeams';
import { DEFAULT_START_TIME, DEFAULT_END_TIME, DEFAULT_CAPACITY } from '../features/availability/constants';
import type { TimeRange } from '../features/availability/types';

export function ModifyAvailability() {
  const {
    schedule,
    setSchedule,
    loading: scheduleLoading,
    error: scheduleError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveSchedule
  } = useAvailabilitySchedule();

  const {
    blockedDates,
    loading: blockedDatesLoading,
    saving: savingBlockedDate,
    error: blockedDatesError,
    addBlockedDate,
    removeBlockedDate
  } = useBlockedDates();

  const {
    teams,
    loading: teamsLoading,
    error: teamsError
  } = useTeams();

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<keyof typeof schedule>>(new Set(['monday']));
  const [dateOverrides, setDateOverrides] = useState<Array<{
    date: string;
    ranges: TimeRange[];
    teamId?: string;
  }>>([]);
  const [newTimeRange, setNewTimeRange] = useState<TimeRange>({
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    capacity: DEFAULT_CAPACITY,
    teamId: ''
  });
  const [newOverride, setNewOverride] = useState<TimeRange>({
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    capacity: DEFAULT_CAPACITY,
    showAllTimes: false
  });
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    reason: '',
    applyToAllTeams: false,
    teamId: undefined
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveSchedule = async () => {
    try {
      await saveSchedule();
      setSuccess('Schedule saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleAddTimeRange = () => {
    if (selectedDays.size === 0) return;

    // Ensure teamId is set when adding new time range
    const rangeWithTeam = {
      ...newTimeRange,
      teamId: selectedTeam
    };

    // Update teamId when adding time range
    setSchedule(prev => {
      const next = { ...prev };
      selectedDays.forEach(day => {
        next[day] = {
          ...next[day],
          ranges: [...next[day].ranges, { ...newTimeRange, teamId: selectedTeam }]
        };
      });
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleRemoveTimeRange = (day: keyof typeof schedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter((_, i) => i !== index)
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleDaySelect = (day: keyof typeof schedule) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  // Update teamId when team selection changes
  useEffect(() => {
    setNewBlockedDate(prev => ({
      ...prev,
      teamId: selectedTeam,
      applyToAllTeams: false
    }));
  }, [selectedTeam]);

  if (scheduleLoading || blockedDatesLoading || teamsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modify Availability</h1>
          <p className="text-gray-600 mt-1">
            Manage weekly schedules, capacity overrides, and blocked dates
          </p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSaveSchedule}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        )}
      </div>

      {scheduleError && <Alert type="error" message={scheduleError} />}
      {blockedDatesError && <Alert type="error" message={blockedDatesError} />}
      {teamsError && <Alert type="error" message={teamsError} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <WeeklySchedule
              schedule={schedule}
              setSchedule={setSchedule}
              selectedDays={selectedDays}
              onDaySelect={handleDaySelect}
              onRemoveTimeRange={handleRemoveTimeRange}
              newTimeRange={newTimeRange}
              onNewTimeRangeChange={setNewTimeRange}
              onAddTimeRange={handleAddTimeRange}
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              onClearTimeRange={() => {
                setNewTimeRange({
                  startTime: DEFAULT_START_TIME,
                  endTime: DEFAULT_END_TIME,
                  capacity: DEFAULT_CAPACITY,
                  teamId: ''
                });
                setSelectedDays(new Set());
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Capacity Overrides</h2>
              <CapacityOverrides
                overrides={dateOverrides}
                newOverride={newOverride}
                teams={teams}
                selectedTeam={selectedTeam}
                onNewOverrideChange={setNewOverride}
                onAddOverride={async () => {
                  setDateOverrides(prev => {
                    // Check if we already have an override for this date
                    const existingIndex = prev.findIndex(o => o.date === newOverride.date);
                  
                    if (existingIndex >= 0) {
                      // Update existing override
                      const updated = [...prev];
                      updated[existingIndex].ranges.push({ ...newOverride });
                      updated[existingIndex].teamId = selectedTeam;
                      return updated;
                    } else {
                      // Add new override
                      return [...prev, {
                        date: newOverride.date,
                        ranges: [{ ...newOverride }],
                        teamId: selectedTeam
                      }];
                    }
                  });

                  // Reset form
                  setNewOverride({
                    startTime: DEFAULT_START_TIME,
                    endTime: DEFAULT_END_TIME,
                    capacity: DEFAULT_CAPACITY,
                    showAllTimes: false
                  });
                }}
                onRemoveOverride={(date, index) => {
                  setDateOverrides(prev => prev.filter((_, i) => i !== index));
                }}
              />
            </div>
            <BlockedDates
              blockedDates={blockedDates}
              newBlockedDate={newBlockedDate}
              teams={teams}
              selectedTeam={selectedTeam}
              onNewBlockedDateChange={setNewBlockedDate}
              onAddBlockedDate={() => addBlockedDate(newBlockedDate)}
              onRemoveBlockedDate={removeBlockedDate}
              loading={blockedDatesLoading}
              saving={savingBlockedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}