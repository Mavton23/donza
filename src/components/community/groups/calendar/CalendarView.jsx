import { useState } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import EventBadge from './EventBadge';
import EventModal from './EventModal';

export default function CalendarView({ 
  events, 
  groupMembers,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [view, setView] = useState('month'); // 'month' or 'week'

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getEventsForDay = (day) => {
    return events.filter(event => 
      isSameDay(new Date(event.start), day)
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronLeft size={20} />
          </button>
          
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView(view === 'month' ? 'week' : 'month')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md"
          >
            {view === 'month' ? 'Week View' : 'Month View'}
          </button>
          
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
            className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FiPlus size={16} className="mr-1" />
            New Event
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day}
              className="bg-gray-100 dark:bg-gray-800 py-2 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {monthDays.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <div 
                key={day.toString()}
                className={`min-h-24 p-1 bg-white dark:bg-gray-900 ${isCurrentMonth ? '' : 'text-gray-400 dark:text-gray-600'}`}
              >
                <div className={`text-right p-1 ${isSameDay(day, new Date()) ? 'bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.eventId}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${event.type === 'meeting' ? 'bg-blue-100 dark:bg-blue-900/30' : event.type === 'study_session' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-80 truncate">
                        {format(new Date(event.start), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4">
          {/* Week view implementation would go here */}
          <p className="text-center text-gray-500">Week view coming soon</p>
        </div>
      )}

      <EventModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={(eventData) => {
          if (selectedEvent) {
            onUpdateEvent({ ...selectedEvent, ...eventData });
          } else {
            onCreateEvent(eventData);
          }
        }}
        groupMembers={groupMembers}
      />
    </div>
  );
}