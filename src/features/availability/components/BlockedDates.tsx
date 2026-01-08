import React from 'react';
import { Ban, X, Calendar, Globe } from 'lucide-react';
import type { BlockedDate, Team } from '../types';
import { Select } from '../../../components/ui/Select';

interface BlockedDatesProps {
  blockedDates: BlockedDate[];
  newBlockedDate: BlockedDate;
  onNewBlockedDateChange: (date: BlockedDate) => void;
  onAddBlockedDate: () => void;
  onRemoveBlockedDate: (date: string) => void;
  loading: boolean;
  saving: boolean;
  teams: Team[];
  selectedTeam: string;
}

const DEFAULT_BLOCKED_DATE: BlockedDate = {
  date: new Date().toLocaleDateString('en-CA'),
  reason: '',
  applyToAllTeams: false,
  teamId: undefined
};

export function BlockedDates({
  blockedDates,
  newBlockedDate,
  onNewBlockedDateChange,
  onAddBlockedDate,
  onRemoveBlockedDate,
  loading,
  saving,
  teams,
  selectedTeam
}: BlockedDatesProps) {
  if (!selectedTeam) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a team to manage blocked dates
      </div>
    );
  }

  return (
    <div className="bg-red-50 rounded-lg shadow-lg p-6">
      <h2 className="text-sm font-semibold mb-2">Blocked Dates</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date to Block</label>
          <input
            type="date"
            value={newBlockedDate.date}
            onChange={(e) => onNewBlockedDateChange({ ...newBlockedDate, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
          <textarea
            value={newBlockedDate.reason}
            onChange={(e) => onNewBlockedDateChange({ ...newBlockedDate, reason: e.target.value })}
            placeholder="e.g., Holiday, Maintenance"
            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
            rows={2}
          />
          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={newBlockedDate.applyToAllTeams || false}
              onChange={(e) => onNewBlockedDateChange({
                ...newBlockedDate,
                applyToAllTeams: e.target.checked,
                teamId: e.target.checked ? undefined : selectedTeam
              })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Apply to all teams
            </span>
          </label>
        </div>
        <button
          onClick={onAddBlockedDate}
          disabled={!newBlockedDate.date || saving}
          className="w-full flex items-center justify-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Ban className="w-4 h-4 mr-2" />
          {saving ? 'Blocking...' : 'Block Date'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      ) : blockedDates.length === 0 ? (
        <p className="text-gray-500 text-center mt-4">No dates are currently blocked</p>
      ) : (
        <div className="mt-3 space-y-2">
          {blockedDates
            .filter(blocked => blocked.applyToAllTeams || blocked.teamId === selectedTeam)
            .map((blocked) => (
            <div
              key={blocked.date}
              className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-red-200"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 text-red-600 mr-2" />
                  <span className="text-xs font-medium">
                    {new Date(blocked.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {blocked.applyToAllTeams && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      All Teams
                    </span>
                  )}
                  {!blocked.applyToAllTeams && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {teams.find(t => t.id === blocked.teamId)?.name}
                    </span>
                  )}
                </div>
                {blocked.reason && <p className="text-xs text-gray-600 mt-0.5">{blocked.reason}</p>}
              </div>
              <button
                onClick={() => onRemoveBlockedDate(blocked.date)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}