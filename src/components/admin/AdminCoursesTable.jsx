import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import CourseActionsDropdown from './CourseActionsDropdown';

export default function AdminCoursesTable() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    level: '',
    sort: 'newest'
  });
  const { user } = useAuth();

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses`, {
        params: { 
          page,
          limit: 10,
          ...filters
        }
      });
      
      setCourses(response.data.data);
      setPagination({
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        totalItems: response.data.meta.total
      });
    } catch (err) {
      console.error('Falha ao carregar cursos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const columns = [
    { 
      accessorKey: 'title',
      header: 'Título', 
      cell: ({ row }) => (
        <Link 
          to={`/courses/${row.original.slug}`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {row.original.title}
        </Link>
      )
    },
    { 
      accessorKey: 'instructor',
      header: 'Instrutor', 
      cell: ({ row }) => row.original.instructor?.fullName || 'N/A'
    },
    { 
      accessorKey: 'status',
      header: 'Status', 
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { 
      accessorKey: 'metrics.enrollments',
      header: 'Alunos', 
      cell: ({ row }) => row.original.metrics?.enrollments || 0
    },
    { 
      accessorKey: 'createdAt',
      header: 'Criado em', 
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('pt-PT')
    },
    { 
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <CourseActionsDropdown 
          courseId={row.original.courseId} 
          status={row.original.status} 
        />
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Cursos
        </h2>
        <div className="flex space-x-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
          
          <select
            value={filters.level}
            onChange={(e) => setFilters({...filters, level: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os níveis</option>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum curso encontrado
        </div>
      ) : (
        <>
          <div className="rounded-md border dark:border-gray-700">
            <Table
              data={courses}
              columns={columns}
            />
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchCourses}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}