import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import api from '@/services/api';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import Modal from '@/components/common/Modal';
import AssignmentStatusBadge from '@/components/assignments/AssignmentStatusBadge';
import Pagination from '@/components/common/Pagination';
import { Plus } from 'lucide-react';

export default function InstructorAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAssignments = async (page = 1, search = '', filter = 'all') => {
    try {
      setLoading(true);
      const response = await api.get(`/assignment/courses/assignments`, {
        params: {
          page,
          search: search || undefined,
          status: filter !== 'all' ? filter : undefined
        }
      });
      setAssignments(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleDeleteAssignment = async () => {
    try {
      await api.delete(`/assignment/assignments/${assignmentToDelete.assignmentId}`);
      setAssignments(assignments.filter(a => a.assignmentId !== assignmentToDelete.assignmentId));
      setDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao excluir tarefa');
    }
  };

  const handlePublishToggle = async (assignmentId, currentStatus) => {
    try {
      const response = await api.put(`/assignment/assignments/${assignmentId}`, {
        isPublished: !currentStatus
      });
      
      setAssignments(assignments.map(a => 
        a.assignmentId === assignmentId 
          ? { ...a, isPublished: !currentStatus } 
          : a
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar status da tarefa');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssignments(1, searchTerm, statusFilter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Crie e gerencie tarefas para seus cursos
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={user.status === 'pending' ? '#' : '/instructor/assignments/new'}
            className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  user?.status === 'pending'
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Tarefa
            {user?.status === 'pending' && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                Pendente
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar tarefas..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <select
            className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="closed">Encerrado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa encontrada"
          description={searchTerm || statusFilter !== 'all' 
            ? "Nenhuma tarefa corresponde aos critérios de busca." 
            : "Você ainda não criou nenhuma tarefa."}
          action={
            <Link
              to={user.status === 'pending' ? '#' : '/instructor/assignments/new'}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Criar Sua Primeira Tarefa
            </Link>
          }
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {assignments.map((assignment) => (
                <li key={assignment.assignmentId}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Link
                          to={`/instructor/assignments/${assignment.assignmentId}`}
                          className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {assignment.title}
                        </Link>
                        <span className="ml-3">
                          <AssignmentStatusBadge status={assignment.isPublished ? 'published' : 'draft'} />
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePublishToggle(assignment.assignmentId, assignment.isPublished)}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            assignment.isPublished
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                          }`}
                        >
                          {assignment.isPublished ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => navigate(`/instructor/assignments/${assignment.assignmentId}/edit`)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setAssignmentToDelete(assignment);
                            setDeleteModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Prazo: {assignment.dueDate ? formatDateTime(assignment.dueDate) : 'Sem prazo definido'}
                        </p>
                        {assignment.course && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            {assignment.course.title}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <Link
                          to={`/instructor/assignments/${assignment.assignmentId}/submissions`}
                          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          {assignment.submissionsCount || 0} submissões
                          {assignment.ungradedCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                              {assignment.ungradedCount} para avaliar
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Tarefa"
        actions={
          <>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDeleteAssignment}
            >
              Excluir
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tem certeza que deseja excluir a tarefa "{assignmentToDelete?.title}"? Esta ação não pode ser desfeita.
        </p>
        {assignmentToDelete?.submissionsCount > 0 && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">
            Aviso: Esta tarefa tem {assignmentToDelete.submissionsCount} submissões que também serão excluídas.
          </p>
        )}
      </Modal>
    </div>
  );
}