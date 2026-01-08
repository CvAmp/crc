import React from 'react';
import { ChevronLeft, Minus, ChevronRight } from 'lucide-react';

export type TogglePosition = 'before' | 'exact' | 'after';

interface ThreeWayToggleProps {
  value: TogglePosition;
  onChange: (value: TogglePosition) => void;
  label: string;
}

export function ThreeWayToggle({ value, onChange, label }: ThreeWayToggleProps) {
  const positions: TogglePosition[] = ['before', 'exact', 'after'];
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-primary-text">{label}</span>
      <div className="relative bg-secondary-bg rounded-full h-10 w-32">
        <div
          className="absolute inset-y-1 w-1/3 bg-primary-bg rounded-full shadow-md transition-transform duration-200 ease-in-out"
          style={{
            transform: `translateX(${
              value === 'before' ? '0%' : value === 'exact' ? '100%' : '200%'
            })`
          }}
        />
        <div className="relative flex h-full">
          {positions.map((position) => (
            <button
              key={position}
              onClick={() => onChange(position)}
              className={`
                flex-1 flex items-center justify-center transition-colors duration-200
                ${value === position ? 'text-accent' : 'text-secondary-text hover:text-primary-text'}
              `}
              title={`Filter ${position} ${label.toLowerCase()}`}
            >
              {position === 'before' && <ChevronLeft className="w-4 h-4" />}
              {position === 'exact' && <Minus className="w-4 h-4" />}
              {position === 'after' && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}