import { useState } from 'react';
import DateRangePicker from '@/components/common/DateRangePicker';
import SelectInput from '@/components/common/SelectInput';

export default function InstitutionReviewFilters({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: null,
      minRating: null,
      courseId: null,
      instructorId: null,
      status: 'all'
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="font-medium mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <DateRangePicker
            value={localFilters.dateRange}
            onChange={(range) => setLocalFilters(prev => ({ ...prev, dateRange: range }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Minimum Rating</label>
          <SelectInput
            options={[
              { value: null, label: 'Any' },
              { value: 4, label: '4+ Stars' },
              { value: 3, label: '3+ Stars' }
            ]}
            value={localFilters.minRating}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, minRating: value }))}
          />
        </div>

        {/* Adicione mais filtros conforme necessário */}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleReset}
          className="px-3 py-2 text-sm border rounded-md"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md"
        >
          Apply
        </button>
      </div>
    </div>
  );
}