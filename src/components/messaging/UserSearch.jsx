import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '@/services/api';

export default function UserSearch({ onSelect, currentUserRole, selectedUser, onClearSelection }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsDropdownOpen(false);
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
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserRole]);

  const handleUserSelect = (user) => {
    onSelect(user);
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 3 && searchResults.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Pequeno delay para permitir o clique no item antes de fechar
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const handleClearSelection = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    onClearSelection();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Selecionar usuário
      </label>
      
      {selectedUser ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center">
            <Avatar user={selectedUser} size="sm" className="mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedUser.username}
              </p>
              <p className="text-xs text-gray-500">
                {selectedUser.role} • {selectedUser.institutionName || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearSelection}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={
              currentUserRole === 'student' ? "Buscar instrutores..." :
              currentUserRole === 'instructor' ? "Buscar estudantes..." :
              "Buscar usuários..."
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
          />
          
          {loading && (
            <div className="absolute right-3 top-2.5">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {searchResults.map(user => (
                  <li
                    key={user.userId}
                    className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleUserSelect(user)}
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
            </div>
          )}
        </div>
      )}

      {!selectedUser && searchQuery.length > 0 && searchQuery.length < 3 && (
        <p className="text-xs text-gray-500">Digite pelo menos 3 caracteres para buscar</p>
      )}
    </div>
  );
}