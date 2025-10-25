import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import CommunityActionsDropdown from './CommunityActionsDropdown';
import { toast } from 'sonner';

export default function AdminCommunitiesTable() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    membershipType: '',
    search: ''
  });

  const fetchCommunities = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/communities`, {
        params: { 
          page,
          limit: 10,
          ...filters
        }
      });
      
      setCommunities(response.data.data);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.total
      });
    } catch (err) {
      console.error('Falha ao carregar comunidades', err);
      toast.error('Falha ao carregar comunidades');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (communityId, newStatus) => {
    try {
      await api.put(`/admin/communities/${communityId}/status`, {
        status: newStatus
      });
      
      toast.success(`Status da comunidade atualizado para ${getStatusDisplayName(newStatus)}`);
      fetchCommunities(pagination.page);
    } catch (error) {
      console.error('Falha ao atualizar status', error);
      toast.error(error.response?.data?.message || 'Falha ao atualizar status');
    }
  };

  const handleDeleteCommunity = async (communityId) => {
    try {
      await api.delete(`/admin/communities/${communityId}`);
      
      toast.success('Comunidade excluída com sucesso');
      fetchCommunities(pagination.page);
    } catch (error) {
      console.error('Falha ao excluir comunidade', error);
      toast.error(error.response?.data?.message || 'Falha ao excluir comunidade');
    }
  };

  const getStatusDisplayName = (status) => {
    const statusNames = {
      active: 'Ativa',
      archived: 'Arquivada',
      suspended: 'Suspensa'
    };
    return statusNames[status] || status;
  };

  const getMembershipTypeDisplayName = (type) => {
    const typeNames = {
      open: 'Aberta',
      approval: 'Aprovação',
      invite_only: 'Convite'
    };
    return typeNames[type] || type;
  };

  useEffect(() => {
    fetchCommunities();
  }, [filters]);

  const columns = [
    { 
      accessorKey: 'name',
      header: 'Nome', 
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {row.original.thumbnailImage ? (
            <img 
              src={row.original.thumbnailImage} 
              alt={row.original.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                {row.original.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <Link 
            to={`/communities/${row.original.slug}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {row.original.name}
          </Link>
        </div>
      )
    },
    { 
      accessorKey: 'creator',
      header: 'Criador', 
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.creator?.avatarUrl ? (
            <img 
              src={row.original.creator.avatarUrl} 
              alt={row.original.creator.username}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {row.original.creator?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span>{row.original.creator?.username || 'N/A'}</span>
        </div>
      )
    },
    { 
      accessorKey: 'status',
      header: 'Status', 
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { 
      accessorKey: 'membershipType',
      header: 'Tipo', 
      cell: ({ row }) => (
        <span className="capitalize px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {getMembershipTypeDisplayName(row.original.membershipType)}
        </span>
      )
    },
    { 
      accessorKey: 'isPublic',
      header: 'Visibilidade', 
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.original.isPublic 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }`}>
          {row.original.isPublic ? 'Pública' : 'Privada'}
        </span>
      )
    },
    { 
      accessorKey: 'stats.members',
      header: 'Membros', 
      cell: ({ row }) => row.original.stats?.members || 0
    },
    { 
      accessorKey: 'stats.posts',
      header: 'Posts', 
      cell: ({ row }) => row.original.stats?.posts || 0
    },
    { 
      accessorKey: 'stats.studyGroups',
      header: 'Grupos', 
      cell: ({ row }) => row.original.stats?.studyGroups || 0
    },
    { 
      accessorKey: 'createdAt',
      header: 'Criada em', 
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('pt-PT')
    },
    { 
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <CommunityActionsDropdown 
          communityId={row.original.communityId} 
          status={row.original.status} 
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteCommunity}
        />
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Comunidades
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar comunidades..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativa</option>
            <option value="archived">Arquivada</option>
            <option value="suspended">Suspensa</option>
          </select>
          
          <select
            value={filters.membershipType}
            onChange={(e) => setFilters({...filters, membershipType: e.target.value})}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Todos os tipos</option>
            <option value="open">Aberta</option>
            <option value="approval">Aprovação</option>
            <option value="invite_only">Convite</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : communities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma comunidade encontrada
        </div>
      ) : (
        <>
          <div className="rounded-md border dark:border-gray-700">
            <Table
              data={communities}
              columns={columns}
            />
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchCommunities}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}