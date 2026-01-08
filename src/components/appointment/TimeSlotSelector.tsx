import React, { useState } from 'react';
import { format, parseISO, isSameDay, addDays, addMinutes } from 'date-fns';
import { Clock, Check, AlertCircle, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { TimeSlot } from '../../types';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  allowUnavailable?: boolean;
  onAllowUnavailableChange?: (value: boolean) => void;
  onDateChange?: (date: Date) => void;
}

export function TimeSlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  allowUnavailable = false,
  onAllowUnavailableChange,
  onDateChange
}: TimeSlotSelectorProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const generateTimeSlots = (includeAllHours: boolean) => {
    const timeSlots: string[] = [];
    const startHour = 0;  // Always start at midnight
    const endHour = 24;   // Go up to midnight next day
    
    // Generate slots for every half hour
    for (let hour = startHour; hour < endHour; hour++) {
      // Skip non-business hours when not in acceleration mode
      if (!includeAllHours && (hour < 8 || hour >= 17)) {
        continue;
      }
      for (let minute of [0, 30]) {
        timeSlots.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
      }
    }
    return timeSlots.sort();
  };

  // Get unique dates and times
  const dates = Array.from(new Set(slots.map(slot => 
    format(parseISO(slot.startTime), 'yyyy-MM-dd')
  ))).sort();
  
  // Always include next few days in acceleration mode
  if (allowUnavailable) {
    const nextFewDays = Array.from({ length: 5 }, (_, i) => 
      format(addDays(currentDate, i), 'yyyy-MM-dd')
    );
    const allDates = new Set([...dates, ...nextFewDays]);
    dates.splice(0, dates.length, ...Array.from(allDates).sort());
  } else if (dates.length === 0) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
  }

  // Generate all possible time slots
  const times = generateTimeSlots(allowUnavailable).sort();

  // Create a map of date-time to slot for quick lookup
  const slotMap = new Map();
  slots.forEach(slot => {
    const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    const time = format(parseISO(slot.startTime), 'HH:mm');
    slotMap.set(`${date}-${time}`, slot);
  });

  const getSlotForDateTime = (date: string, time: string): TimeSlot | undefined => {
    const existingSlot = slotMap.get(`${date}-${time}`);
    if (existingSlot) return existingSlot;

    // Create virtual slot with 0 capacity for unallocated times
    const slotTime = `${date}T${time}:00`;
    return {
      startTime: slotTime,
      endTime: format(addMinutes(parseISO(slotTime), 30), "yyyy-MM-dd'T'HH:mm:ss"),
      capacity: 0,
      available: 0
    };

    return undefined;
  };

  const getSlotStatus = (slot: TimeSlot | undefined) => {
    if (!slot) return { available: false, text: '0/0' };

    const isAvailable = allowUnavailable || slot.available > 0;
    const text = `${slot.available}/${slot.capacity}`;

    return {
      available: isAvailable,
      text,
      color: !slot.available && allowUnavailable ? 'purple' : 'green'
    };
  };

  const handleSlotClick = (slot: TimeSlot | undefined) => {
    if (!slot) return;
    // Allow selection of any slot in acceleration mode
    if (allowUnavailable || slot.available > 0) {
      onSelectSlot(slot);
    }
  };

  if (slots.length === 0 && !allowUnavailable) {
    return (
      <div className="text-center py-8 text-gray-500">
        No available time slots found for the selected criteria
      </div>
    );
  }

  const isSlotSelected = (slot: TimeSlot | undefined) => {
    if (!slot || !selectedSlot) return false;
    return isSameDay(parseISO(slot.startTime), parseISO(selectedSlot.startTime)) &&
           format(parseISO(slot.startTime), 'HH:mm') === format(parseISO(selectedSlot.startTime), 'HH:mm');
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 1 : -1);
    setCurrentDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleDateChange('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM d, yyyy')}
          </h3>
          
          <button
            onClick={() => handleDateChange('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mt-2">
            <Tooltip content="Enable to view and book unavailable slots" position="top">
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowUnavailable}
                  onChange={(e) => onAllowUnavailableChange?.(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700 flex items-center">
                  <Rocket className="w-4 h-4 mr-1" />
                  Acceleration Mode
                </span>
              </label>
            </Tooltip>
          </div>
          {allowUnavailable && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
              Acceleration Mode
            </span>
          )}
        </div>
      </div>
      
      {allowUnavailable && (
        <div className="flex items-start space-x-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-700">
            <p className="font-medium">Acceleration Mode Active</p>
            <p>You can now select any time slot, including unavailable ones. This will create an acceleration request instead of a standard appointment.</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-r bg-gray-100" />
              {dates.map(date => (
                <th key={date} className="px-4 py-2 text-sm font-medium text-gray-900 border-r">
                  {format(parseISO(date), 'EEE, MMM d')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 divide-x">
            {times.map(time => (
              <tr key={time} className="divide-x divide-gray-200">
                <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r bg-gray-50">
                  {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                </td>
                {dates.map(date => {
                  const slot = getSlotForDateTime(date, time);
                  const status = getSlotStatus(slot);
                  const selected = isSlotSelected(slot);

                  return (
                    <td key={`${date}-${time}`} className="p-1 border-r">
                      {slot && (
                        <button
                          onClick={() => handleSlotClick(slot)}
                          disabled={!status.available}
                          className={`
                            w-full px-2 py-1 rounded text-sm transition-colors relative
                            ${selected
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : status.available
                              ? allowUnavailable && (!slot || slot.available === 0)
                                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {status.text}
                          {selected && (
                            <Check className="w-4 h-4 text-blue-500 absolute top-1 right-1" />
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}