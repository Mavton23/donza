import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LessonCard from '@/components/lessons/LessonCard';
import LessonFilters from '@/components/lessons/LessonFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import api from '@/services/api';

export default function LessonList() {
  usePageTitle();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Filtros iniciais
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    lessonType: searchParams.get('type') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || 'newest',
    isFree: searchParams.get('free') === 'true' || false
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.page,
          search: filters.search,
          type: filters.lessonType,
          level: filters.level,
          sort: filters.sort,
          free: filters.isFree,
          independent: true 
        };

        const response = await api.get('/lessons/independent', { params });
        
        setLessons(response.data.data || []);
        setPagination({
          page: response.data.meta.page,
          totalPages: response.data.meta.totalPages,
          totalItems: response.data.meta.total
        });
      } catch (err) {
        setError('Erro ao carregar aulas. Tente novamente.');
        console.error('Failed to load lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [pagination.page, filters]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    handleFilterChange({
      search: '',
      lessonType: '',
      level: '',
      sort: 'newest',
      isFree: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Aulas Independentes
          </h1>
          {!loading && pagination.totalItems > 0 && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mostrando {lessons.length} de {pagination.totalItems} aulas
            </p>
          )}
        </div>
        
        {user?.role === 'instructor' && (
          <Link
            to="/instructor/lessons/new"
            className="mt-4 md:mt-0 px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors"
          >
            Criar Nova Aula
          </Link>
        )}
      </div>

      {/* Filtros */}
      <LessonFilters 
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : lessons.length === 0 ? (
        <EmptyState
          title="Nenhuma aula encontrada com os filtros atuais"
          action={
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Limpar Filtros
            </button>
          }
        />
      ) : (
        <>
          {/* Lista de aulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map(lesson => (
              <LessonCard 
                key={lesson.lessonId}
                lesson={lesson}
                showInstructorActions={user?.role === 'instructor'}
              />
            ))}
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}