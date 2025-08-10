import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function MemberRoleBadge({ role, onChange, editable = true }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const roleColors = {
    leader: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'co-leader': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    member: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };

  const handleRoleChange = (newRole) => {
    onChange(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div 
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors[role]} ${editable ? 'cursor-pointer' : ''}`}
        onClick={() => editable && setIsOpen(!isOpen)}
      >
        {role}
        {editable && <FiChevronDown className="ml-1" />}
      </div>
      
      {isOpen && editable && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
          {Object.keys(roleColors).map(r => (
            <div
              key={r}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${role === r ? 'font-bold' : ''}`}
              onClick={() => handleRoleChange(r)}
            >
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}