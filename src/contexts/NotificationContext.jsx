import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(({ type = 'info', message, title = '', duration = 5000 }) => {
    const id = uuidv4();
    const newNotification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, newNotification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((type, message, options = {}) => {
    return addNotification({ type, message, ...options });
  }, [addNotification]);

  // Métodos específicos para cada tipo de notificação
  const api = {
    info: (message, options) => showNotification('info', message, options),
    success: (message, options) => showNotification('success', message, options),
    warning: (message, options) => showNotification('warning', message, options),
    error: (message, options) => showNotification('error', message, options),
    remove: removeNotification,
    show: showNotification
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-end justify-start p-4 space-y-2 pointer-events-none z-50">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationToast = ({ notification, onClose }) => {
  const { type, title, message } = notification;
  
  // Configurações de estilo baseadas no tipo
  const typeStyles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900',
      border: 'border-blue-400 dark:border-blue-600',
      text: 'text-blue-800 dark:text-blue-100',
      icon: (
        <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
      )
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900',
      border: 'border-green-400 dark:border-green-600',
      text: 'text-green-800 dark:text-green-100',
      icon: (
        <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900',
      border: 'border-yellow-400 dark:border-yellow-600',
      text: 'text-yellow-800 dark:text-yellow-100',
      icon: (
        <svg className="w-5 h-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900',
      border: 'border-red-400 dark:border-red-600',
      text: 'text-red-800 dark:text-red-100',
      icon: (
        <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg border ${styles.bg} ${styles.border}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <h3 className={`text-sm font-medium ${styles.text}`}>
                {title}
              </h3>
            )}
            <p className={`mt-1 text-sm ${styles.text}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md ${styles.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-400`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};