import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '../../features/time/utils';
import { TimeSlotGrid } from './TimeSlotGrid';
import { useSlotAvailability } from '../../hooks/useSlotAvailability';
import type { TimeSlot } from '../../features/calendar/types';

interface DailyCalendarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  productTypeId: string | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  allowAcceleration?: boolean;
  onAccelerationChange?: (enabled: boolean) => void;
  onError?: (error: string) => void;
}

export function DailyCalendar({
  date,
  onDateChange,
  productTypeId,
  selectedSlot,
  onSelectSlot,
  allowAcceleration,
  onAccelerationChange,
  onError
}: DailyCalendarProps) {
  const { slots, loading, minNoticeSlots } = useSlotAvailability({
    productTypeId,
    selectedDate: date,
    allowUnavailable: allowAcceleration,
    onError
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onDateChange(new Date(date.setDate(date.getDate() - 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        <button
          onClick={() => onDateChange(new Date(date.setDate(date.getDate() + 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <TimeSlotGrid
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
          minNoticeSlots={minNoticeSlots}
          allowAcceleration={allowAcceleration}
          onAccelerationChange={onAccelerationChange}
        />
      )}
    </div>
  );
}