import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Table from '../common/Table';
import EventStatusBadge from '../common/EventStatusBadge';
import Pagination from '../common/Pagination';
import EventActionsDropdown from './EventActionsDropdown';

export default function AdminEventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    sort: 'upcoming'
  });

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/events/admin/events', {
        params: { 
          page,
          limit: 10,
          ...filters
        }
      });
      
      setEvents(response.data.data.events);
      setPagination({
        page: response.data.data.page,
        totalPages: response.data.data.totalPages,
        totalItems: response.data.data.totalItems
      });
    } catch (err) {
      console.error('Falha ao carregar eventos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const columns = [
    { 
      accessorKey: 'title',
      header: 'Título', 
      cell: ({ row }) => (
        <Link 
          to={`/events/${row.original.eventId}`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {row.original.title}
        </Link>
      )
    },
    { 
      accessorKey: 'organizer',
      header: 'Organizador', 
      cell: ({ row }) => row.original.organizer?.name || row.original.organizer?.fullName || 'N/A'
    },
    { 
      accessorKey: 'status',
      header: 'Status', 
      cell: ({ row }) => <EventStatusBadge status={row.original.status} />
    },
    { 
      accessorKey: 'startDate',
      header: 'Data', 
      cell: ({ row }) => new Date(row.original.startDate).toLocaleString('pt-PT')
    },
    { 
      accessorKey: 'participantsCount',
      header: 'Participantes', 
      cell: ({ row }) => row.original.participantsCount || 0
    },
    { 
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => <EventActionsDropdown eventId={row.original.eventId} status={row.original.status} />
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Eventos
        </h2>
        <div className="flex space-x-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os status</option>
            <option value="scheduled">Agendado</option>
            <option value="live">Em andamento</option>
            <option value="completed">Concluído</option>
            <option value="canceled">Cancelado</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os tipos</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="meetup">Meetup</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum evento encontrado
        </div>
      ) : (
        <>
          <div className="rounded-md border dark:border-gray-700">
            <Table
              data={events}
              columns={columns}
            />
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchEvents}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}