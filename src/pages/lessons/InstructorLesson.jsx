import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import LessonCard from '@/components/lessons/LessonCard';
import api from '@/services/api';
import { Filter, Grid, List, Plus, Play, FileText, HelpCircle } from 'lucide-react';

export default function InstructorLessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft', 'archived'

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await api.get('/lessons/instructor/my-lessons');
        setLessons(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar aulas');
        console.error('Erro ao carregar aulas:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLessons();
    }
  }, [user]);

  // Filtrar aulas baseado no filtro selecionado
  const filteredLessons = lessons.filter(lesson => {
    if (filter === 'all') return true;
    if (filter === 'published') return lesson.isPublished;
    if (filter === 'draft') return !lesson.isPublished;
    if (filter === 'archived') return lesson.status === 'archived';
    return true;
  });

  // Estatísticas rápidas
  const stats = {
    total: lessons.length,
    published: lessons.filter(l => l.isPublished).length,
    draft: lessons.filter(l => !l.isPublished).length,
    archived: lessons.filter(l => l.status === 'archived').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Aulas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie todas as suas aulas em um só lugar
          </p>
        </div>
        
        <Link
          to={user?.status === 'pending' ? '#' : '/instructor/lessons/new'}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            user?.status === 'pending'
              ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Nova Aula
          {user?.status === 'pending' && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
              Pendente
            </span>
          )}
        </Link>
      </div>

      {/* Estatísticas e Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Publicadas</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draft}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Rascunhos</div>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.archived}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Arquivadas</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas as aulas</option>
              <option value="published">Publicadas</option>
              <option value="draft">Rascunhos</option>
              <option value="archived">Arquivadas</option>
            </select>
          </div>

          {/* Modo de visualização */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : filteredLessons.length === 0 ? (
        <EmptyState
          title={
            filter === 'all' 
              ? "Nenhuma aula encontrada" 
              : `Nenhuma aula ${getFilterLabel(filter)}`
          }
          description={
            filter === 'all'
              ? "Você ainda não criou nenhuma aula."
              : `Você não tem aulas ${getFilterLabel(filter)}.`
          }
          action={
            user?.status !== 'pending' && (
              <Link
                to="/instructor/lessons/new"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Criar Sua Primeira Aula
              </Link>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        // Visualização em Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonId}
              lesson={lesson}
              showInstructorActions={true}
              showStatus={true}
              statusBadge={true}
              variant="instructor"
            />
          ))}
        </div>
      ) : (
        // Visualização em Lista
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLessons.map((lesson) => (
              <li key={lesson.lessonId}>
                <Link
                  to={`/instructor/lessons/${lesson.lessonId}/edit`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Ícone do tipo de aula */}
                        <div className="flex-shrink-0 mr-4">
                          {getLessonTypeIcon(lesson.lessonType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {lesson.shortDescription || lesson.content?.substring(0, 60) + '...'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          lesson.isPublished
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {lesson.lessonType} • {formatDuration(lesson.duration)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <p>
                          Criada em{' '}
                          <time dateTime={lesson.createdAt}>
                            {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}
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

// Funções auxiliares
function getFilterLabel(filter) {
  const labels = {
    all: '',
    published: 'publicadas',
    draft: 'em rascunho',
    archived: 'arquivadas'
  };
  return labels[filter] || '';
}

function getLessonTypeIcon(lessonType) {
  const icons = {
    video: (
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    ),
    text: (
      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
    ),
    quiz: (
      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
        <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
    ),
    assignment: (
      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
        <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      </div>
    )
  };
  return icons[lessonType] || icons.text;
}

function formatDuration(minutes) {
  if (!minutes) return 'Duração variável';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}