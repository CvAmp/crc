import React, { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, X, AlertCircle, CalendarDays, View as ViewDay, View as ViewWeek } from 'lucide-react';
import { DayView } from '../components/DayView';
import { WeekView } from '../components/calendar/WeekView';
import { MonthView } from '../components/calendar/MonthView';
import { EventFilterToggle, EventFilter } from '../components/EventFilterToggle';
import { useStore } from '../store';
import { Tabs } from '../components/ui/Tabs';
import type { CalendarEvent } from '../types';

type CalendarViewType = 'day' | 'week' | 'month';

// Helper function to safely parse ISO date strings
const safeParseISO = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    return parseISO(dateString);
  } catch (e) {
    console.error('Error parsing date:', e);
    return null;
  }
};

// Helper Components
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
    <p className="text-red-700">{message}</p>
  </div>
);

const EventIndicator = ({ count }: { count: number }) => (
  <div className="flex items-center space-x-1">
    <CalendarIcon className="w-4 h-4 text-blue-600" />
    <span className="text-sm font-medium text-blue-600">
      {count} appointment{count !== 1 ? 's' : ''}
    </span>
  </div>
);

const EventCard = ({ event, onClick }: { event: CalendarEvent; onClick: () => void }) => {
  const startTime = safeParseISO(event.startTime);

  if (!startTime) return null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm transition-colors duration-150"
    >
      <div className="space-y-0.5">
        <div className="font-medium">SO-{event.orderId}</div>
        <div className="text-xs flex justify-between">
          <span>{format(startTime, 'HH:mm')}</span>
          <span className="truncate ml-2">{event.customerName}</span>
        </div>
      </div>
    </button>
  );
};

function Calendar() {
  const navigate = useNavigate();
  const store = useStore();
  const { user, impersonatedUser } = store;
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>('my-events');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const users = store.users;
  const teams = store.teams;

  useEffect(() => {
    if (user) {
      fetchUserTeam();
    }
  }, [user]);

  const fetchUserTeam = async () => {
    const currentUser = users.find(u => u.id === user?.id);
    if (currentUser?.teamId) {
      setUserTeamId(currentUser.teamId);
      setTeamMembers(users
        .filter(u => u.teamId === currentUser.teamId)
        .map(u => u.id)
      );
    }
  };

  const formatAppointmentTime = (date: string) => {
    const parsedDate = safeParseISO(date);
    return parsedDate ? format(parsedDate, 'h:mm a') : '';
  };

  const handleCreateEvent = async (startTime: Date, endTime: Date) => {
    if (!user) {
      setError('You must be logged in to create events');
      return;
    }

    // Navigate to create appointment page with selected date
    navigate('/create-appointment', {
      state: { selectedDate: startTime }
    });
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/appointment/${eventId}`);
  };

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Filter events based on date range and user selection
      const filteredEvents = store.events.filter(event => {
        switch (eventFilter) {
          case 'my-events':
            return event.createdBy === user.id;
          case 'team-events':
            return teamMembers.includes(event.createdBy);
          default:
            return true;
        }
      });
      
      setEvents(filteredEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, user, eventFilter, teamMembers, store.events]);

  const renderDayAppointments = (dayEvents: CalendarEvent[]) => {
    // Sort events chronologically
    const sortedEvents = [...dayEvents].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Display first 6 events in month view, all events in other views
    const limit = viewType === 'month' ? 6 : sortedEvents.length;
    const displayedEvents = sortedEvents.slice(0, limit);
    const remainingCount = sortedEvents.length - limit;

    return (
      <div className="space-y-1">
        {displayedEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(event.id)}
            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors duration-150 ${
              viewType === 'month'
                ? 'text-xs bg-blue-50 hover:bg-blue-100'
                : 'hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 whitespace-nowrap">
                {formatAppointmentTime(event.startTime)}
              </span>
              <span className={`truncate ${viewType === 'month' ? 'text-blue-700' : 'text-gray-900'}`}>
                {event.title}
              </span>
            </div>
          </button>
        ))}
        {remainingCount > 0 && (
          <div className={`px-2 py-1 ${viewType === 'month' ? 'text-xs' : 'text-sm'}`}>
            <span className="font-medium text-blue-600">
              +{remainingCount} more appointment{remainingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-primary-text">Calendar View</h1>
          <Tabs
            tabs={[
              {
                id: 'day',
                label: 'Day',
                icon: ViewDay,
                content: null
              },
              {
                id: 'week',
                label: 'Week',
                icon: ViewWeek,
                content: null
              },
              {
                id: 'month',
                label: 'Month',
                icon: CalendarDays,
                content: null
              }
            ]}
            defaultTab={viewType}
            onChange={(tab) => setViewType(tab as CalendarViewType)}
            variant="minimal"
          />
        </div>
        <EventFilterToggle value={eventFilter} onChange={setEventFilter} />
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Day View */}
      {viewType === 'day' ? (
        <DayView
          date={currentDate}
          events={events.filter(event => {
            const eventDate = safeParseISO(event.startTime);
            return eventDate && isSameDay(eventDate, currentDate);
          })}
          onDateChange={setCurrentDate}
          onSelectSlot={(startTime, endTime) => {
            navigate('/create-appointment', {
              state: { selectedDate: startTime }
            });
          }}
        />
      ) : viewType === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={events}
          onDateChange={setCurrentDate}
          renderDayAppointments={renderDayAppointments}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={events}
          loading={loading}
          onDateChange={setCurrentDate}
          onDayClick={(date) => {
            setSelectedDate(date);
            setShowDayView(true);
          }}
          renderDayAppointments={renderDayAppointments}
        />
      )}
      
      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowDayView(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <DayView
                date={selectedDate}
                events={events.filter(event => {
                  const eventDate = safeParseISO(event.startTime);
                  if (!eventDate) return false;
                  return isSameDay(eventDate, selectedDate);
                })}
                onDateChange={(newDate) => setSelectedDate(newDate)}
                onSelectSlot={(start, end) => {
                  navigate('/create-appointment', {
                    state: { selectedDate: start }
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;