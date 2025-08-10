import { BellIcon } from "lucide-react";

export default function NotificationBadge({ count }) {
  return (
    <button 
      className="p-1.5 relative rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Notifications (${count} unread)`}
    >
      <BellIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}