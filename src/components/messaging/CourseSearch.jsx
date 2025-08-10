import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CourseSearch({ onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get('/search/enrolled-courses', {
          params: { q: searchQuery, enrolledOnly: true }
        });
        setSearchResults(response.data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (course) => {
    setSelectedCourse(course);
    onSelect(course);
    setSearchQuery(course.title);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Course
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={selectedCourse ? selectedCourse.title : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (selectedCourse) setSelectedCourse(null);
          }}
          placeholder="Search your enrolled courses..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
        />
        
        {loading && (
          <div className="absolute right-3 top-2.5">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {!selectedCourse && searchResults.length > 0 && (
        <ul className="mt-1 border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-auto">
          {searchResults.map(course => (
            <li
              key={course.courseId}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(course)}
            >
              <div className="flex items-center">
                <BookOpen className="flex-shrink-0 h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Instructor: {course.instructor?.username || 'Unknown'}
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