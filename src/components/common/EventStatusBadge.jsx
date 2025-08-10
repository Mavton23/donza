export default function EventStatusBadge({ status }) {
    const statusMap = {
      scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Scheduled' },
      live: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Live' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Completed' },
      canceled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Canceled' }
    };
  
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.label || status}
      </span>
    );
  }