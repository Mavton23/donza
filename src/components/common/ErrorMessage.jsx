import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorMessage({ message, onClose }) {
  useEffect(() => {
    if (onClose) {
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [onClose]);

  if (!message) return null;

  return (
    <div 
      className="relative bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-md"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg 
            className="h-5 w-5 text-red-500 dark:text-red-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            aria-label="Fechar alerta"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
