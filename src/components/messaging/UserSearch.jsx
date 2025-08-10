import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

export default function UserSearch({ onSelect, currentUserRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get('/search/messageable-users', {
          params: { 
            q: searchQuery,
            allowedRoles: currentUserRole === 'student' ? ['instructor', 'institution'] : 
                         currentUserRole === 'instructor' ? ['student', 'institution'] :
                         ['student', 'instructor', 'institution']
          }
        });
        setSearchResults(response.data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserRole]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select User
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            currentUserRole === 'student' ? "Search instructors..." :
            currentUserRole === 'instructor' ? "Search students..." :
            "Search users..."
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
        />
        
        {loading && (
          <div className="absolute right-3 top-2.5">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <ul className="mt-1 border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-auto">
          {searchResults.map(user => (
            <li
              key={user.userId}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                onSelect(user);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <div className="flex items-center">
                <Avatar user={user} size="sm" className="mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role} • {user.institutionName || ''}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}