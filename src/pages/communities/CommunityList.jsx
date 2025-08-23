import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import CommunityCard from '../../components/community/CommunityCard';
import Pagination from '../../components/common/Pagination';
import { FiUsers, FiPlus, FiLock, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function CommunitiesList() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    visibility: 'all',
    membershipType: 'all',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  const canCreateCommunity = user?.role === 'instructor' || user?.role === 'institution';
  const isStudent = user?.role === 'student';

  const fetchCommunities = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        ...(filters.visibility !== 'all' && { visibility: filters.visibility }),
        ...(filters.membershipType !== 'all' && { membershipType: filters.membershipType }),
        sort: filters.sortBy === 'newest' ? 'createdAt,DESC' : 
              filters.sortBy === 'oldest' ? 'createdAt,ASC' :
              filters.sortBy === 'popular' ? 'membersCount,DESC' : 'createdAt,DESC'
      };

      const response = await api.get('/community/communities', { params });

      setCommunities(response.data.data || []);
      setPagination({
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.total || 0
      });
    } catch (err) {
      console.error('Failed to fetch communities', err);
      setCommunities([]);
      setPagination({
        page: 1,
        totalPages: 1,
        totalItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCommunities(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      visibility: 'all',
      membershipType: 'all',
      sortBy: 'newest'
    });
    fetchCommunities(1);
  };

  useEffect(() => {
    fetchCommunities();
  }, [filters]);

  const safeCommunities = Array.isArray(communities) ? communities : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <FiUsers className="text-indigo-600 dark:text-indigo-400 text-2xl" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Comunidades
          </h1>
        </div>

        {user && (
          <div className="flex items-center">
            {canCreateCommunity ? (
              <Link
                to={user.status === 'pending' ? '#' : '/communities/new'}
                className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  user?.status === 'pending'
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-custom-primary text-white hover:bg-custom-primary-hover'
                }`}
                aria-label="Criar nova comunidade"
              >
                <FiPlus className="h-4 w-4 mr-1" />
                Criar Comunidade
                {user?.status === 'pending' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                    Pendente
                  </span>
                )}
              </Link>
            ) : isStudent ? (
              <Tooltip content="Somente instrutores e instituições podem criar comunidades">
                <button 
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
                  disabled
                  aria-disabled
                >
                  <FiLock className="mr-2" />
                  Criar Comunidade
                </button>
              </Tooltip>
            ) : null}
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar comunidades..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Pesquisar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FiFilter />
            Filtros
            {Object.values(filters).some(f => f !== 'all') || searchQuery ? (
              <Badge variant="solid" className="ml-1">
                {[searchQuery, ...Object.values(filters)].filter(Boolean).length}
              </Badge>
            ) : null}
          </Button>
        </form>

        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibilidade
                </label>
                <Select
                  value={filters.visibility}
                  onValueChange={(value) => handleFilterChange('visibility', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Associação
                </label>
                <Select
                  value={filters.membershipType}
                  onValueChange={(value) => handleFilterChange('membershipType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="approval">Requer Aprovação</SelectItem>
                    <SelectItem value="invite">Somente por Convite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ordenar Por
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="popular">Mais populares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <FiX size={16} />
                Limpar Filtros
              </Button>

              <Button onClick={() => fetchCommunities(1)}>
                Aplicar Filtros
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {loading && communities === null ? (
        <LoadingSpinner fullScreen />
      ) : safeCommunities.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="Nenhuma comunidade ainda"
          description={
            canCreateCommunity 
              ? "Seja o primeiro a criar uma comunidade!" 
              : user
                ? "Não há comunidades disponíveis no momento. Volte mais tarde!"
                : "Faça login para ver as comunidades disponíveis"
          }
          action={
            canCreateCommunity ? (
              <Link
                to={user.status === 'pending' ? '#' : '/communities/new'}
                className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  user?.status === 'pending'
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                aria-label="Create new community"
              >
                <FiPlus className="h-4 w-4 mr-1" />
                Criar Comunidade
                {user?.status === 'pending' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                    Pendente
                  </span>
                )}
              </Link>
            ) : !user ? (
              <Link
                to="/login"
                className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Entrar
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCommunities.map((community) => {
              if (!community?.communityId) return null;

              return (
                <CommunityCard
                  key={community.communityId}
                  community={{
                    communityId: community.communityId,
                    name: community.name || 'Unnamed Community',
                    shortDescription: community.shortDescription || '',
                    description: community.description || '',
                    coverImage: community.coverImage || null,
                    thumbnailImage: community.thumbnailImage || null,
                    isPublic: community.isPublic ?? true,
                    membershipType: community.membershipType || 'open',
                    creator: {
                      username: community.creator?.username || 'Unknown',
                      avatarUrl: community.creator?.avatarUrl || null,
                      role: community.creator?.role || null,
                    },
                    stats: {
                      members: parseInt(community.stats?.members) || 0,
                      posts: parseInt(community.stats?.posts) || 0,
                      studyGroups: parseInt(community.stats?.studyGroups) || 0,
                    },
                    createdAt: community.createdAt || new Date().toISOString(),
                    tags: Array.isArray(community.tags) ? community.tags : [],
                    rules: community.rules || {},
                  }}
                />
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchCommunities}
                disabled={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}