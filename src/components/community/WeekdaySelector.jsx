import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';

const weekdays = [
  { id: 'monday', label: 'Mon', full: 'Monday' },
  { id: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { id: 'thursday', label: 'Thu', full: 'Thursday' },
  { id: 'friday', label: 'Fri', full: 'Friday' },
  { id: 'saturday', label: 'Sat', full: 'Saturday' },
  { id: 'sunday', label: 'Sun', full: 'Sunday' }
];

export default function WeekdaySelector({ selectedDays, onChange }) {
  const toggleDay = (day) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    onChange(newDays);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {weekdays.map(day => (
        <button
          key={day.id}
          type="button"
          onClick={() => toggleDay(day.id)}
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
            selectedDays.includes(day.id)
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Icon 
            name={selectedDays.includes(day.id) ? "check" : "circle"} 
            size="sm" 
          />
          {day.label}
        </button>
      ))}
    </div>
  );
}

WeekdaySelector.propTypes = {
  selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};