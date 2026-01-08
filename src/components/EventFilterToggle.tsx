import React from 'react';
import { Users, User, Globe } from 'lucide-react';

export type EventFilter = 'my-events' | 'team-events' | 'all-events';

interface EventFilterToggleProps {
  value: EventFilter;
  onChange: (value: EventFilter) => void;
}

export function EventFilterToggle({ value, onChange }: EventFilterToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-secondary-bg bg-secondary-bg p-1">
      <button
        onClick={() => onChange('my-events')}
        className={`inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          value === 'my-events'
            ? 'bg-primary-bg text-accent shadow-sm'
            : 'text-secondary-text hover:text-primary-text'
        }`}
      >
        <User className="w-4 h-4" />
        <span>My Events</span>
      </button>
      <button
        onClick={() => onChange('team-events')}
        className={`inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          value === 'team-events'
            ? 'bg-primary-bg text-accent shadow-sm'
            : 'text-secondary-text hover:text-primary-text'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Team Events</span>
      </button>
      <button
        onClick={() => onChange('all-events')}
        className={`inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          value === 'all-events'
            ? 'bg-primary-bg text-accent shadow-sm'
            : 'text-secondary-text hover:text-primary-text'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>All Events</span>
      </button>
    </div>
  );
}