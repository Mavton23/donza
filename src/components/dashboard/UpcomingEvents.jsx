import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpcomingEvents({ events }) {
  if (events.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <Link
            to="/events"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.eventId}
              to={`/events/${event.eventId}`}
              className="block group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-gray-700 rounded-lg p-2 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {event.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {event.isOnline ? (
                      <span>Online Event</span>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}