import { FiCalendar, FiUsers, FiBook, FiVideo } from 'react-icons/fi';

const eventTypes = {
  meeting: {
    icon: <FiVideo className="text-blue-500" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  },
  study_session: {
    icon: <FiBook className="text-green-500" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  group_event: {
    icon: <FiUsers className="text-purple-500" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  },
  default: {
    icon: <FiCalendar className="text-gray-500" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
};

export default function EventBadge({ type }) {
  const eventType = eventTypes[type] || eventTypes.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventType.color}`}>
      {eventType.icon}
      <span className="ml-1 capitalize">{type.replace('_', ' ')}</span>
    </span>
  );
}