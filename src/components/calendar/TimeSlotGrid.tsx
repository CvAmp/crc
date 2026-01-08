import React from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { Clock, AlertCircle, Rocket, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { TimeSlot } from '../../types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  minNoticeSlots: number;
  allowAcceleration?: boolean;
  onAccelerationChange?: (enabled: boolean) => void;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  minNoticeSlots,
  allowAcceleration = false,
  onAccelerationChange
}: TimeSlotGridProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const daysPerPage = 5;  // Always show 5 days

  // Generate 5 consecutive dates starting from the first slot date or today
  const startDate = slots.length > 0 
    ? parseISO(slots[0].startTime) 
    : new Date();
  
  // Always generate 5 days worth of dates
  const dates = Array.from({ length: daysPerPage }, (_, i) => 
    format(addDays(startDate, i), 'yyyy-MM-dd')
  );

  // Generate all possible time slots for business hours (8 AM to 5 PM)
  const times = Array.from({ length: 18 }, (_, i) => { // 18 slots (9 hours * 2 slots per hour)
    const hour = Math.floor(i / 2) + 8; // Start at 8 AM
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

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
    const endTime = new Date(slotTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    return {
      startTime: slotTime,
      endTime: endTime.toISOString(),
      capacity: 0,
      available: 0
    };
  };

  const getSlotStatus = (slot: TimeSlot | undefined) => {
    if (!slot) return { available: false, text: '0/0' };

    const isAvailable = allowAcceleration || slot.available > 0;
    const text = `${slot.available}/${slot.capacity}`;

    return {
      available: isAvailable,
      text,
      color: !slot.available && allowAcceleration ? 'purple' : 'green'
    };
  };

  const handleSlotClick = (slot: TimeSlot | undefined) => {
    if (!slot) return;
    // Allow selection of any slot in acceleration mode
    if (allowAcceleration || slot.available > 0) {
      onSelectSlot(slot);
    }
  };

  const isSlotSelected = (slot: TimeSlot | undefined) => {
    if (!slot || !selectedSlot) return false;
    return format(parseISO(slot.startTime), 'yyyy-MM-dd HH:mm') === 
           format(parseISO(selectedSlot.startTime), 'yyyy-MM-dd HH:mm');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Available Time Slots</h3>
            {allowAcceleration && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Acceleration Mode
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip content="Enable to view and book unavailable slots" position="top">
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAcceleration}
                  onChange={(e) => onAccelerationChange?.(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700 flex items-center">
                  <Rocket className="w-4 h-4 mr-1" />
                  Acceleration Mode
                </span>
              </label>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {allowAcceleration && (
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
                <th key={date} className="px-4 py-2 text-sm font-medium text-gray-900 border-r w-[calc((100%-5rem)/5)]">
                  {format(parseISO(date), 'EEE, MMM d')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 divide-x">
            {times.map(time => (
              <tr key={time} className="divide-x divide-gray-200">
                <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r bg-gray-50 w-20 whitespace-nowrap">
                  {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                </td>
                {dates.map(date => {
                  const slot = getSlotForDateTime(date, time);
                  const status = getSlotStatus(slot);
                  const selected = isSlotSelected(slot);

                  return (
                    <td key={`${date}-${time}`} className="p-1 border-r w-[calc((100%-5rem)/5)]">
                      {slot && (
                        <button
                          onClick={() => handleSlotClick(slot)}
                          disabled={!status.available}
                          className={`
                            w-full px-2 py-1 rounded text-sm transition-colors relative
                            ${selected
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : status.available
                              ? allowAcceleration && (!slot || slot.available === 0)
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