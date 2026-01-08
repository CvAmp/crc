import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  loading: boolean;
  onDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  renderDayAppointments: (dayEvents: CalendarEvent[]) => React.ReactNode;
}

export function MonthView({
  currentDate,
  events,
  loading,
  onDateChange,
  onDayClick,
  renderDayAppointments
}: MonthViewProps) {
  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-text">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-primary-bg rounded-lg shadow border border-secondary-bg h-full flex flex-col">
        <div className="grid grid-cols-7 gap-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-secondary-text p-2 bg-secondary-bg">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px flex-1">
          {eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
          }).map((day) => {
            const dayEvents = events.filter(event => {
              const eventDate = parseISO(event.startTime);
              return isSameDay(eventDate, day);
            });
            
            return (
              <div
                key={day.toString()}
                className="p-2 border border-secondary-bg bg-primary-bg hover:bg-accent/5 transition-colors duration-150 cursor-pointer flex flex-col"
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-primary-text">
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {dayEvents.length > 0 && !loading && renderDayAppointments(dayEvents)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}