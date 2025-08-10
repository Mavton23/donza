import { useState } from "react";

export default function ArrayInput({ 
  title, 
  description, 
  items = [], 
  onChange 
}) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </label>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {description}
      </p>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder={`Add ${title.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
      
      <ul className="mt-2 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
            <span>{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}