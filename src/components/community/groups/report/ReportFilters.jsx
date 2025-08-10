import { FiCalendar, FiFilter } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

const periods = [
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'Last 30 days' },
  { id: 'quarter', label: 'Last 3 months' },
  { id: 'year', label: 'Last year' },
  { id: 'all', label: 'All time' }
];

export default function ReportFilters({ 
  period, 
  setPeriod,
  onExport,
  isLoading 
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <FiFilter className="text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 rounded-full text-sm ${period === p.id ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<FiCalendar />}
          onClick={onExport}
          disabled={isLoading}
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}