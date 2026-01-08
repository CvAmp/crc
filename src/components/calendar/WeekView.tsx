import React from 'react';
import { format, startOfWeek, addDays, getWeek, endOfWeek, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '../../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
  renderDayAppointments: (dayEvents: CalendarEvent[]) => React.ReactNode;
}

export function WeekView({
  currentDate,
  events,
  onDateChange,
  renderDayAppointments
}: WeekViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-text">This Week</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onDateChange(addDays(currentDate, -7))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-secondary-text font-medium">
            Wk {getWeek(currentDate)} ({format(startOfWeek(currentDate), 'MMM d')}-{format(endOfWeek(currentDate), 'd')})
          </div>
          <button
            onClick={() => onDateChange(addDays(currentDate, 7))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-secondary-bg">
        {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate), i)).map((day) => {
          const dayEvents = events.filter(event => {
            const eventDate = parseISO(event.startTime);
            return isSameDay(eventDate, day);
          });

          return (
            <div key={day.toString()} className="bg-primary-bg p-4 border border-secondary-bg">
              <h2 className="font-medium text-sm text-primary-text">
                {format(day, 'EEEE')}
              </h2>
              <p className="mt-1 text-2xl text-primary-text">
                {format(day, 'd')}
              </p>
              {renderDayAppointments(dayEvents)}
            </div>
          );
        })}
      </div>
    </div>
  );
}