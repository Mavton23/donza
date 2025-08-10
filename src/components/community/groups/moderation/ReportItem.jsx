import { FiAlertTriangle, FiCheck, FiFlag, FiMoreVertical } from 'react-icons/fi';
import Avatar from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import Dropdown from '@/components/common/Dropdown';
import TimeAgo from '@/components/common/TimeAgo';

const severityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
};

export default function ReportItem({ report, isSelected, onSelect, onToggleSelect }) {
  const getContentPreview = () => {
    if (report.contentType === 'message') {
      return report.reportedContent?.text?.substring(0, 100) + '...';
    }
    return report.reportedContent?.title || 'No title available';
  };

  return (
    <div 
      className={`p-4 rounded-lg border hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
      onClick={() => onSelect(report)}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center mt-1">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(!isSelected);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge className={severityColors[report.severity]}>
                {report.severity}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {report.contentType}
              </span>
            </div>
            
            <Dropdown
              trigger={
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiMoreVertical />
                </button>
              }
              items={[
                { label: 'Quick Resolve', icon: <FiCheck />, onClick: () => onToggleSelect(true) },
                { label: 'Escalate', icon: <FiFlag />, onClick: () => {/* implement */} },
              ]}
            />
          </div>
          
          <h4 className="mt-1 font-medium truncate">
            {report.reason}
          </h4>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
            {getContentPreview()}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar 
                src={report.reportedBy.avatarUrl} 
                alt={report.reportedBy.username} 
                size="xs"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Reported by {report.reportedBy.username}
              </span>
            </div>
            
            <TimeAgo 
              date={report.createdAt} 
              className="text-xs text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}