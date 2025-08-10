import { FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';

const trendIcons = {
  up: <FiTrendingUp className="text-green-500" />,
  down: <FiTrendingDown className="text-red-500" />,
  neutral: <FiActivity className="text-gray-500" />
};

export default function ReportCard({ 
  title, 
  value, 
  change, 
  unit = '',
  description = '' 
}) {
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const changeText = change !== 0 ? `${Math.abs(change)}%` : 'No change';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {trendIcons[trend]}
      </div>
      
      <div className="mt-2">
        <p className="text-2xl font-semibold">
          {value} {unit}
        </p>
        
        {change !== 0 && (
          <p className={`inline-flex items-center text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {changeText} {trend === 'up' ? 'increase' : 'decrease'} from last period
          </p>
        )}
        
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}