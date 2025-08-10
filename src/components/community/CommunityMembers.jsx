import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FiSearch, FiUsers } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import MemberCard from './MemberCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useParams } from 'react-router-dom';

/**
 * @typedef {Object} Member
 * @property {string} memberId - ID da associação
 * @property {string} userId - ID do usuário
 * @property {string} username - Nome do usuário
 * @property {string} avatarUrl - URL do avatar
 * @property {string} role - Função na comunidade
 * @property {Date} joinedAt - Data de ingresso
 * @property {Object} stats - Estatísticas do membro
 * @property {number} stats.postCount - Número de posts
 * @property {number} stats.commentCount - Número de comentários
 */

export default function CommunityMembers() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = async (page = 1, query = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/community/communities/${communityId}/members`, {
        params: { 
          page, 
          limit: 12,
          search: query
        }
      });
  
      const formattedMembers = response.data.items.map(item => ({
        memberId: item.userId,
        role: item.role,
        joinedAt: item.joinedAt,
        user: {
          userId: item.userId,
          username: item.username,
          avatarUrl: item.avatarUrl
        },
        stats: {
          postCount: item.stats?.postCount || 0,
          commentCount: item.stats?.commentCount || 0
        }
      }));
  
      setMembers(formattedMembers);
      setPagination({
        page: response.data.meta.currentPage,
        totalPages: response.data.meta.totalPages,
        totalItems: response.data.meta.totalItems
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members');
      console.error('Fetch members error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [communityId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(1, searchQuery);
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.patch(`/communities/${communityId}/members/${memberId}/role`, {
        role: newRole
      });
      
      setMembers(members.map(member => 
        member.memberId === memberId ? { ...member, role: newRole } : member
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await api.delete(`/communities/${communityId}/members/${memberId}`);
      setMembers(members.filter(member => member.memberId !== memberId));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isAdmin = user?.role === 'admin' || members.find(m => m.userId === user?.userId)?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiUsers className="text-indigo-600 dark:text-indigo-400" />
          Community Members
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            icon={<FiSearch />}
          />
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner className="my-8" />
      ) : members.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title={searchQuery ? "No matching members" : "No members yet"}
          description={searchQuery 
            ? "Try adjusting your search query" 
            : "Be the first to join this community"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map(member => (
              <MemberCard
                key={member.memberId}
                member={member}
                onRoleChange={isAdmin ? handleRoleChange : null}
                onRemove={isAdmin ? handleRemoveMember : null}
                currentUserId={user?.userId}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => fetchMembers(page, searchQuery)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}