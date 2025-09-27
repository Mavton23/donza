export default function MessageLimitIndicator({ current, limit }) {
    const percentage = Math.min(100, (current / limit) * 100);
    
    return (
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Mensagens diárias</span>
          <span>{current} / {limit}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              percentage >= 90 ? 'bg-red-500' : 
              percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }