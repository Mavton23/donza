export default function LoadingSpinner({ size = "medium", fullScreen = false }) {
    const sizeClasses = {
      small: "h-5 w-5",
      medium: "h-8 w-8",
      large: "h-12 w-12"
    };
  
    const spinner = (
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400 ${sizeClasses[size]}`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
          {spinner}
        </div>
      );
    }
  
    return spinner;
  }