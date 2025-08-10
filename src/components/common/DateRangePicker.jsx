import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon, X } from 'lucide-react';

export default function DateRangePicker({ value, onChange, ...props }) {
  const [startDate, endDate] = value || [null, null];

  const handleChange = (dates) => {
    const [start, end] = dates;
    onChange([start, end]);
  };

  const clearSelection = () => {
    onChange([null, null]);
  };

  return (
    <div className="relative">
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <div className="pl-3 pr-2 py-2 text-gray-400 dark:text-gray-500">
          <CalendarIcon className="h-5 w-5" />
        </div>
        
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleChange}
          isClearable={false}
          className="flex-1 px-3 py-2 focus:outline-none bg-transparent"
          placeholderText="Select date range"
          dateFormat="MMM d, yyyy"
          {...props}
        />
        
        {(startDate || endDate) && (
          <button
            onClick={clearSelection}
            className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear selection"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {startDate && endDate && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Selected: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}