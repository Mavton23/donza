import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DateTimePicker({ control, name, ...props }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DatePicker
          selected={field.value}
          onChange={(date) => field.onChange(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
          {...props}
        />
      )}
    />
  );
}