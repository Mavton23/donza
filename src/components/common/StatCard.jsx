import PropTypes from 'prop-types';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  change = null, 
  icon = null,
  className = '' 
}) {
  const getChangeColor = () => {
    if (change === null || change === 0) return 'text-gray-500 dark:text-gray-400';
    return change > 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = () => {
    if (change === null || change === 0) return <Minus size={14} />;
    return change > 0 
      ? <ArrowUp size={14} className="inline" /> 
      : <ArrowDown size={14} className="inline" />;
  };

  const formatChange = () => {
    if (change === null) return 'N/A';
    return `${Math.abs(change)}%`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {value?.toLocaleString() ?? '-'}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined && change !== null) && (
        <div className={`mt-4 flex items-center text-sm ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="ml-1">
            {formatChange()} {change !== 0 && (change > 0 ? 'increase' : 'decrease')}
          </span>
          {change !== 0 && <span className="ml-1">vs last period</span>}
        </div>
      )}
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  change: PropTypes.number,
  icon: PropTypes.node,
  className: PropTypes.string
};