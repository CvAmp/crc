import React from 'react';
import { format, parseISO, isSameDay, isWithinInterval, isBefore } from 'date-fns';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CalendarEvent } from '../types';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectSlot?: (startTime: Date, endTime: Date) => void;
  onDateChange?: (newDate: Date) => void;
}

export function DayView({ date, events, onSelectSlot, onDateChange }: DayViewProps) {
  const navigate = useNavigate();
  const currentTime = new Date();
  const businessHours = {
    start: 9, // 9 AM
    end: 17,  // 5 PM
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Generate time slots for the day
  const timeSlots = Array.from(
    { length: (businessHours.end - businessHours.start) * 2 }, // 30-minute intervals
    (_, index) => {
      const hour = Math.floor(index / 2) + businessHours.start;
      const minutes = (index % 2) * 30;
      const slotDate = new Date(date);
      slotDate.setHours(hour, minutes, 0, 0);
      return slotDate;
    }
  );

  const isSlotBooked = (slotStart: Date, slotEnd: Date) => {
    return events.some(event => {
      const eventStart = parseISO(event.startTime);
      const eventEnd = parseISO(event.endTime);
      return isWithinInterval(slotStart, { start: eventStart, end: eventEnd }) ||
             isWithinInterval(slotEnd, { start: eventStart, end: eventEnd }) ||
             isWithinInterval(eventStart, { start: slotStart, end: slotEnd });
    });
  };

  const getEventsForSlot = (slotTime: Date) => {
    return sortedEvents.filter(event => {
      const eventStart = parseISO(event.startTime);
      const eventEnd = parseISO(event.endTime);
      return isSameDay(eventStart, slotTime) && 
             isWithinInterval(slotTime, { start: eventStart, end: eventEnd });
    });
  };

  return (
    <div className="bg-primary-bg rounded-lg shadow-lg overflow-hidden border border-secondary-bg">
      {/* Header */}
      <div className="p-4 bg-secondary-bg border-b border-secondary-bg flex items-center justify-between">
        <button
          onClick={() => onDateChange?.(new Date(date.setDate(date.getDate() - 1)))}
          className="p-2 hover:bg-primary-bg rounded-full text-secondary-text hover:text-primary-text"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-primary-text flex-1 text-center">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => onDateChange?.(new Date(date.setDate(date.getDate() + 1)))}
          className="p-2 hover:bg-primary-bg rounded-full text-secondary-text hover:text-primary-text"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-secondary-bg relative">
        {timeSlots.map((slotTime, index) => {
          const slotEnd = new Date(slotTime);
          slotEnd.setMinutes(slotEnd.getMinutes() + 30);
          
          const isPast = isBefore(slotTime, currentTime);
          const isBooked = isSlotBooked(slotTime, slotEnd);
          const slotEvents = getEventsForSlot(slotTime);
          const isCurrentTimeSlot = isWithinInterval(currentTime, {
            start: slotTime,
            end: slotEnd
          });

          return (
            <div
              key={slotTime.toISOString()}
              className={`
                relative min-h-[60px] transition-colors flex
                ${isPast ? 'bg-secondary-bg/50' : 'hover:bg-accent/5'}
                ${isCurrentTimeSlot ? 'bg-accent/5' : ''}
              `}
            >
              {/* Time indicator */}
              <div className="flex items-start space-x-2 text-sm w-24 flex-shrink-0 p-4 border-r border-secondary-bg bg-secondary-bg/50">
                <Clock className={`w-4 h-4 ${isPast ? 'text-secondary-text/50' : 'text-secondary-text'}`} />
                <span className={isPast ? 'text-secondary-text/50' : 'text-primary-text'}>
                  {format(slotTime, 'h:mm a')}
                </span>
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center space-x-4">
                  {/* Events */}
                  {slotEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/appointment/${event.id}`)}
                      className="p-2 bg-accent/10 rounded-md flex-1 cursor-pointer hover:bg-accent/20 transition-colors duration-150"
                    >
                      <div className="font-medium text-accent">
                        {event.title}
                      </div>
                      <div className="text-sm text-accent/80">
                        {event.customerName}
                      </div>
                    </div>
                  ))}

                  {/* Availability indicator */}
                  {!isPast && !isBooked && (
                    <button
                      onClick={() => onSelectSlot?.(slotTime, slotEnd)}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      Available
                    </button>
                  )}
                </div>
              </div>
              {/* Current time indicator */}
              {isCurrentTimeSlot && (
                <div className="absolute left-0 w-1 h-full bg-accent top-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 bg-secondary-bg border-t border-secondary-bg">
        <div className="flex items-center space-x-4 text-sm text-secondary-text">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-accent/10 rounded-full" />
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-secondary-bg rounded-full" />
            <span>Past</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-bg border border-green-600 dark:border-green-400 rounded-full" />
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}