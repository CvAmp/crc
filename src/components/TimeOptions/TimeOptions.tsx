import React from 'react';

interface TimeOptionsProps {
  value: string;
  onChange: (value: string) => void;
  minTime?: string;
  maxTime?: string;
  label?: string;
  className?: string;
}

const TimeOptions: React.FC<TimeOptionsProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  label,
  className
}) => {
  const generateTimeOptions = () => {
    const options = [];
    const start = minTime ? 
      Math.max(parseTimeToMinutes(minTime), 0) : 
      0;
    const end = maxTime ? 
      Math.min(parseTimeToMinutes(maxTime), 24 * 60) : 
      24 * 60;

    for (let minutes = start; minutes < end; minutes += 30) {
      const time = formatMinutesToTime(minutes);
      options.push(time);
    }
    return options;
  };

  const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className || "w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"}
      >
        {generateTimeOptions().map((time) => (
          <option key={time} value={time}>
            {formatTime(time)}
          </option>
        ))}
      </select>
    </div>
  );
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const hour12 = Number(hours) % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

export default TimeOptions;