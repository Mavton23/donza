export default function ProgressBar({ 
    percentage, 
    height = 2,
    color = 'indigo',
    className = '' 
  }) {
    const heightClasses = {
      1: 'h-1',
      2: 'h-2',
      3: 'h-3',
      4: 'h-4'
    };
  
    const colorClasses = {
      indigo: 'bg-indigo-600 dark:bg-indigo-400',
      green: 'bg-green-600 dark:bg-green-400',
      red: 'bg-red-600 dark:bg-red-400',
      yellow: 'bg-yellow-600 dark:bg-yellow-400'
    };
  
    return (
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[height]} ${className}`}>
        <div 
          className={`${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    );
  }