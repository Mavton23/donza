export default function CourseProgress({ value, size = 'md' }) {
    const sizeClasses = {
      sm: 'h-2 text-xs',
      md: 'h-3 text-sm',
      lg: 'h-4 text-base'
    };
  
    return (
      <div className="flex items-center">
        <div className={`${sizeClasses[size]} w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2`}>
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {Math.round(value)}%
        </span>
      </div>
    );
  }