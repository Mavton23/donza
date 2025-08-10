import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CourseCard from '@/components/courses/CourseCard';
import CourseFilters from '@/components/courses/CourseFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import api from '@/services/api';

export default function CourseList({ variant = 'catalog' }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Configurações baseadas no variant
  const isEnrolledView = variant === 'enrolled';
  const pageTitle = isEnrolledView ? 'Meus Cursos' : 'Explorar Cursos';
  const emptyStateMessage = isEnrolledView 
    ? "Você ainda não se inscreveu em nenhum curso" 
    : "Nenhum curso encontrado com os filtros atuais";

  // Filtros iniciais
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || 'newest',
    ...(!isEnrolledView && { enrolled: false })
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.page,
          search: filters.search,
          category: filters.category,
          level: filters.level,
          sort: filters.sort,
          ...(isEnrolledView && { includeProgress: true })
        };

        const endpoint = isEnrolledView 
          ? `/courses/courses/${user.userId}/enrolled`
          : '/courses';

        const response = await api.get(endpoint, { params });
        
        setCourses(response.data.data || []);
        setPagination({
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        totalItems: response.data.meta.total
      });
      } catch (err) {
        setError('Erro ao carregar cursos. Tente novamente.');
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [pagination.page, filters, user?.userId, isEnrolledView]);

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
      category: '',
      level: '',
      sort: 'newest'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          {!loading && pagination.totalItems > 0 && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mostrando {courses.length} de {pagination.totalItems} cursos
            </p>
          )}
        </div>
        
        {!isEnrolledView && user?.role === 'instructor' && (
          <Link
            to="/instructor/courses/new"
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Criar Novo Curso
          </Link>
        )}
      </div>

      {/* Filtros */}
      <CourseFilters 
        filters={filters}
        onChange={handleFilterChange}
        showEnrolledToggle={!isEnrolledView && !!user}
        variant={variant}
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
      ) : courses.length === 0 ? (
        <EmptyState
          title={emptyStateMessage}
          action={
            isEnrolledView ? (
              <Link
                to="/courses"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Explorar Cursos
              </Link>
            ) : (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Limpar Filtros
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Lista de cursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard 
                key={course.courseId}
                course={course}
                showProgress={isEnrolledView}
                showInstructorActions={!isEnrolledView && user?.role === 'instructor'}
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