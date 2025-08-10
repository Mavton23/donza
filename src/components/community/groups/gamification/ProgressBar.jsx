export default function ProgressBar({ 
    value, 
    max = 100, 
    color = 'indigo',
    label = '',
    showPercentage = true 
  }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const colors = {
      indigo: 'bg-indigo-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    };
  
    return (
      <div className="space-y-1">
        {label && (
          <div className="flex justify-between text-sm font-medium">
            <span>{label}</span>
            {showPercentage && <span>{Math.round(percentage)}%</span>}
          </div>
        )}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`${colors[color] || colors.indigo} h-2.5 rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {!label && showPercentage && (
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            {value}/{max}
          </div>
        )}
      </div>
    );
  }