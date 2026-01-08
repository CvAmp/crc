import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * TimeOptions Component
 * 
 * A time selector that shows a curated range of times (8 AM to 7 PM) by default.
 * Use the toggle button to switch between showing all times or business hours only.
 */
interface TimeOptionsProps {
  value: string;
  onChange: (time: string) => void;
  showAllTimes?: boolean;
  onToggleAllTimes?: (show: boolean) => void;
  hideToggle?: boolean;
  minTime?: string;
  className?: string;
  label?: string;
}

export const TimeOptions: React.FC<TimeOptionsProps> = ({
  value,
  onChange,
  showAllTimes = false,
  onToggleAllTimes,
  hideToggle = false,
  minTime,
  className = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
  label
}) => {
  const [displayedValue, setDisplayedValue] = useState(value);

  // Update displayed value when the actual value changes
  useEffect(() => {
    setDisplayedValue(value);
  }, [value]);

  const generateTimeOptions = () => {
    const options = [];
    // Start with midnight (00:00)
    options.push('00:00');
    // Add 00:30
    options.push('00:30');
    // Add rest of the day (01:00 to 23:30)
    for (let hour = 1; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        options.push(time);
      }
    }
    return options;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const period = Number(hours) >= 12 ? 'PM' : 'AM';
    const hour12 = Number(hours) % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  let options = generateTimeOptions()
    .filter(time => {
      if (!minTime) return true;
      
      // Special handling for times around midnight
      if (minTime >= '23:00') {
        // If minTime is 23:00 or later, allow times up to 00:30
        return time > minTime || time <= '00:30';
      }
      
      return time > minTime;
    })
    .filter(time => {
      if (showAllTimes) return true;
      const [hours] = time.split(':').map(Number);
      return hours >= 8 && hours < 19; // 8 AM to 7 PM
    });

  // Ensure the current value is always in the options list
  if (!options.includes(displayedValue)) {
    options = [...options, displayedValue].sort();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {!hideToggle && onToggleAllTimes && (
          <button
            type="button"
            onClick={() => onToggleAllTimes(!showAllTimes)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              showAllTimes 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{showAllTimes ? 'Show Business Hours' : 'Show All Times'}</span>
          </button>
        )}
      </div>
      <select
        value={displayedValue}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        style={{ scrollbarWidth: 'thin' }}
      >
        {options.map(time => (
          <option key={time} value={time}>
            {formatTime(time)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeOptions;