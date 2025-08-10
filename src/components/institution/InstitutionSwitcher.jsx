import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function InstitutionSwitcher({ currentInstitution, institutions }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-white hover:text-blue-100 focus:outline-none"
      >
        <span className="truncate max-w-xs">{currentInstitution.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Your Institutions
            </div>
            {institutions.map((institution) => (
              <Link
                key={institution.id}
                to={`/institution/${institution.id}/dashboard`}
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="truncate">{institution.name}</span>
                {institution.id === currentInstitution.id && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </Link>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <Link
              to="/institution/join"
              className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              + Add Institution
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}