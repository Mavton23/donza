import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function CustomTagsInput({ value, onChange, maxTags = 10, maxLength = 30 }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:bg-gray-800 ${value.length > 0 ? 'py-1' : ''}`}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300 inline-flex items-center">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200"
              aria-label={`Remover tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? 'Digite uma tag e pressione Enter' : ''}
            className="flex-1 bg-transparent border-none outline-none dark:text-white min-w-[100px]"
            maxLength={maxLength}
          />
        )}
      </div>
    </div>
  );
}

// Tipagem
CustomTagsInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  maxTags: PropTypes.number,
  maxLength: PropTypes.number
};