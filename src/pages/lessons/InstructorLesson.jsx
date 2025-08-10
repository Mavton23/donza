import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import api from '@/services/api';
import { Lock } from 'lucide-react';

export default function InstructorLessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons/lessons`);
        setLessons(response.data.lessons || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar aulas');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Aulas</h1>
        <Link
          to={user.status === 'pending' ? '#' : '/instructor/lessons/new'}
          className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
              user?.status === 'pending'
                ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
          Criar Nova Aula
          {user?.status === 'pending' && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
              Pendente
            </span>
          )}
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : lessons.length === 0 ? (
        <EmptyState
          title="Nenhuma aula encontrada"
          description="Você ainda não criou nenhuma aula."
          action={
            <Link
              to={user.status === 'pending' ? '#' : '/instructor/lessons/new'}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Criar Sua Primeira Aula
            </Link>
          }
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {lessons.map((lesson) => (
              <li key={lesson.lessonId}>
                <Link
                  to={`/instructor/lessons/${lesson.lessonId}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {lesson.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {lesson.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {lesson.courseTitle}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <p>
                          Criado em{' '}
                          <time dateTime={lesson.createdAt}>
                            {new Date(lesson.createdAt).toLocaleDateString()}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}