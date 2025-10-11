import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { Plus } from 'lucide-react';

export default function EventList() {
  usePageTitle();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'scheduled',
    search: searchParams.get('search') || ''
  });

  // Verifica se o usuário pode criar eventos
  const canCreateEvents = ['instructor', 'institution'].includes(user?.role);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = {
          page: pagination.page,
          limit: 10,
          type: filters.type === 'all' ? undefined : filters.type,
          status: filters.status === 'upcoming' ? 'scheduled' : filters.status,
          search: filters.search || undefined
        };

        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const { data } = await api.get('/events', { params });
        
        setEvents(data.data);
        setPagination({
          page: data.meta.page,
          totalPages: data.meta.totalPages,
          totalItems: data.meta.total
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar eventos. Por favor, tente novamente.');
        console.error('Erro ao buscar eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [pagination.page, filters]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      scheduled: 'Próximos',
      live: 'Ao Vivo',
      completed: 'Passados',
      canceled: 'Cancelados'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Eventos {getStatusDisplay(filters.status)}
          </h1>
          {pagination.totalItems > 0 && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mostrando {events.length} de {pagination.totalItems} eventos
            </p>
          )}
        </div>
        
        {/* Mostrar botão de criação apenas para roles permitidos */}
        {canCreateEvents && (
          <Link
            to={user.status === 'pending' ? '#' : '/events/create'}
            className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                user?.status === 'pending'
                  ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-custom-primary text-white hover:bg-custom-primary-hover'
              }`}
          >
            <Plus className='h-4 w-4 mr-1' />
            Novo Evento
            {user?.status === 'pending' && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                Pendente
              </span>
            )}
          </Link>
        )}

        {/* Mensagem para estudantes */}
        {user?.role === 'student' && (
          <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
            Apenas instrutores e instituições podem criar eventos
          </div>
        )}
      </div>

      <EventFilters 
        filters={filters}
        onChange={handleFilterChange}
        statusOptions={[
          { value: 'scheduled', label: 'Próximos' },
          { value: 'live', label: 'Ao Vivo' },
          { value: 'completed', label: 'Passados' },
          { value: 'canceled', label: 'Cancelados' }
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Nenhum evento encontrado"
          description="Nenhum evento corresponde aos filtros atuais."
          action={
            <button
              onClick={() => handleFilterChange({
                type: 'all',
                status: 'scheduled',
                search: ''
              })}
              className="mt-4 px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors"
            >
              Limpar Filtros
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard 
                key={event.eventId}
                event={{
                  ...event,
                  status: event.status === 'scheduled' && new Date(event.startDate) > new Date() ? 
                    'upcoming' : event.status
                }}
              />
            ))}
          </div>

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