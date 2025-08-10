import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-300 mr-3" />
          <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
            Access Denied
          </h2>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unauthorized Access
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have permission to view this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Debug Information
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Current role: {localStorage.getItem('userRole') || 'unknown'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}