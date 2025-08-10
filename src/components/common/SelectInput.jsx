import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';

export default function SelectInput({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border ${
          isOpen ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'
        } rounded-md shadow-sm bg-white dark:bg-gray-800`}
      >
        <span className={`${value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
          {selectedOption.label}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-700">
          <ul className="max-h-60 overflow-auto">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                  value === option.value
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}