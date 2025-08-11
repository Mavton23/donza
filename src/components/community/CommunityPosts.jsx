import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { FiMessageSquare, FiPlus, FiSearch } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CommunityPosts() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    postType: '',
    difficultyLevel: '',
    sortBy: 'newest',
    tags: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const fetchPosts = async (page = 1, query = '', filters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        offset: (page - 1) * pagination.limit,
        limit: pagination.limit,
        search: query,
        ...filters
      };

      const response = await api.get(`/community/communities/${communityId}/posts`, { params });
      
      const postsData = Array.isArray(response.data?.data?.posts) ? response.data.data.posts : [];
      const totalItems = response.data?.data?.total || 0;

      setPosts(postsData);
      setPagination({
        page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
        totalItems
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
      console.error('Fetch posts error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(1, searchQuery, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPosts(1, searchQuery, newFilters);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/community/communities/${communityId}/posts/${postId}`);
      
      setPosts(posts.filter(post => post.postId !== postId));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
      // Recarregar posts em caso de erro
      fetchPosts(pagination.page, searchQuery, filters);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      if (!user?.userId) {
        navigate('/login');
        return;
      }

      const response = await api.post(`/community/communities/posts/${postId}/react`, {
        reactionType
      });

      setPosts(posts.map(post => {
        if (post.postId === postId) {
          const updatedReactions = { ...post.stats };
          
          if (response.data.action === 'added') {
            updatedReactions[`${reactionType}Count`] = (updatedReactions[`${reactionType}Count`] || 0) + 1;
          } else if (response.data.action === 'removed') {
            updatedReactions[`${reactionType}Count`] = Math.max(0, (updatedReactions[`${reactionType}Count`] || 0) - 1);
          }

          return {
            ...post,
            stats: updatedReactions,
            currentUserReaction: response.data.action === 'added' ? reactionType : null
          };
        }
        return post;
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reaction');
    }
  };

  // Verificar permissões do usuário
  const isMember = !!user?.memberships?.find(m => m.communityId === communityId && m.status === 'active');
  const isAdminOrModerator = ['admin', 'moderator'].includes(user?.role);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiMessageSquare className="text-indigo-600 dark:text-indigo-400" />
          Community Posts
        </h1>
        
        {isMember && (
          <Link to={`/communities/${communityId}/posts/new`}>
            <Button variant="primary" icon={<FiPlus />}>
              New Post
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros e busca */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<FiSearch />}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Componente de filtros */}
        {/* <PostFilters 
          filters={filters}
          onChange={handleFilterChange}
        /> */}
      </div>

      {/* Feedback de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Estado de carregamento */}
      {loading ? (
        <LoadingSpinner className="my-8" />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FiMessageSquare}
          title={searchQuery ? "No matching posts" : "No posts yet"}
          description={
            searchQuery 
              ? "Try adjusting your search query" 
              : isMember 
                ? "Share your thoughts with the community!" 
                : "Join the community to view and create posts"
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.postId}
                post={post}
                communityId={communityId}
                onDelete={
                  (user?.userId === post.author.userId || isAdminOrModerator) 
                    ? handleDeletePost 
                    : null
                }
                onReaction={handleReaction}
                currentUserId={user?.userId}
                currentUserReaction={post.currentUserReaction}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => fetchPosts(page, searchQuery, filters)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Componente auxiliar para filtros
function PostFilters({ filters, onChange }) {
  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.postType}
        onChange={(e) => handleChange('postType', e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">All Types</option>
        <option value="discussion">Discussion</option>
        <option value="question">Question</option>
        <option value="resource">Resource</option>
      </select>

      <select
        value={filters.difficultyLevel}
        onChange={(e) => handleChange('difficultyLevel', e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => handleChange('sortBy', e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostCommented">Most Commented</option>
        <option value="mostLiked">Most Liked</option>
      </select>
    </div>
  );
}