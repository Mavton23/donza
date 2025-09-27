import { useState } from 'react';

export default function TagInput({
  tags,
  onTagsChange,
  maxTags = 10,
  maxLength = 20,
  placeholder = "Digite a tag e pressione Enter",
  label = "Tags",
  disabled = false
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (tag) => {
    if (!tag) return;
    
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (tags.length >= maxTags) {
      return;
    }
    
    if (trimmedTag.length > maxLength) {
      return;
    }
    
    if (!tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  return (
    <div>
      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {maxTags && `(Máx. ${maxTags})`}
      </label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 transition-colors"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 inline-flex text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 focus:outline-none"
                disabled={disabled}
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>

      {!disabled && tags.length < maxTags && (
        <div className="flex">
          <input
            type="text"
            id="tags"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      )}

      {tags.length >= maxTags && !disabled && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Limite máximo de {maxTags} tags atingido
        </p>
      )}
    </div>
  );
}