import { useState } from 'react';
import { FiRepeat, FiX } from 'react-icons/fi';

const frequencyOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom...' }
];

const daysOfWeek = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

export default function RecurringEventOptions({ 
  value, 
  onChange 
}) {
  const [showCustom, setShowCustom] = useState(false);
  
  const handleFrequencyChange = (e) => {
    const newValue = { ...value, frequency: e.target.value };
    if (e.target.value !== 'custom') {
      newValue.days = [];
      setShowCustom(false);
    } else {
      setShowCustom(true);
    }
    onChange(newValue);
  };

  const toggleDay = (day) => {
    const newDays = value.days.includes(day)
      ? value.days.filter(d => d !== day)
      : [...value.days, day];
    onChange({ ...value, days: newDays });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <FiRepeat className="text-gray-500 mr-2" />
        <select
          value={value.frequency}
          onChange={handleFrequencyChange}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 text-sm"
        >
          {frequencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showCustom && (
        <div className="ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-1 rounded-md text-sm ${value.days.includes(day.value) ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.frequency !== 'none' && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <span className="mr-2">Ends:</span>
          <input
            type="date"
            value={value.endDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange({ ...value, frequency: 'none', days: [], endDate: '' })}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}