import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BellIcon } from 'lucide-react';

export default function NotificationSettings() {
  const { user } = useOutletContext();
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      announcements: true,
      promotions: false,
      updates: true,
    },
    push: {
      messages: true,
      reminders: true,
    },
  });

  const handleToggle = (type, key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
          <BellIcon className="h-5 w-5" /> Configurações de Notificação
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Controle como você recebe notificações
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-8">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Notificações por Email
            </h4>
            <div className="space-y-4">
              {Object.entries(notificationSettings.email).map(([key, value]) => (
                <div key={`email-${key}`} className="flex items-center justify-between">
                  <div>
                    <label htmlFor={`email-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`${
                      value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={() => handleToggle('email', key)}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        value ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Notificações Push
            </h4>
            <div className="space-y-4">
              {Object.entries(notificationSettings.push).map(([key, value]) => (
                <div key={`push-${key}`} className="flex items-center justify-between">
                  <div>
                    <label htmlFor={`push-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`${
                      value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={() => handleToggle('push', key)}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        value ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}