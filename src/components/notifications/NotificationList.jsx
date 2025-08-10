import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';

export default function NotificationList({ notifications, onMarkAsRead }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <li key={notification.notificationId}>
            <div className={`px-4 py-4 sm:px-6 ${!notification.readAt ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${!notification.readAt ? 'text-blue-800' : 'text-gray-600'} truncate`}>
                  {notification.title}
                </p>
                {!notification.readAt && (
                  <button
                    onClick={() => onMarkAsRead(notification.notificationId)}
                    className="ml-2 flex-shrink-0 flex"
                    title="Marcar como lida"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                  </button>
                )}
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
              {notification.link && (
                <div className="mt-2">
                  <a 
                    href={notification.link}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Ver detalhes →
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}