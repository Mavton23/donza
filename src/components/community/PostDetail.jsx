import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  FiArrowLeft, FiMessageSquare, FiHeart, FiEdit2, 
  FiTrash2, FiMoreVertical, FiExternalLink,
  FiShare2, FiFlag, FiClock, FiEye,
  FiThumbsUp, FiAward, FiEdit3, 
  FiHelpCircle 
} from 'react-icons/fi';
import { Pin, BookOpen, AlertCircle, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Avatar from '../../components/common/Avatar';
import { Badge } from '../../components/ui/badge';
import TimeAgo from '../common/TimeAgo';
import Dropdown from '../../components/common/Dropdown';
import CommentsSection from './CommentsSection';
import ReactionButton from '../common/ReactButton';
import { Button } from '../../components/ui/button';

const getPostTypeIcon = (type) => {
  const icons = {
    discussion: <BookOpen size={16} className="mr-1" />,
    question: <AlertCircle size={16} className="mr-1" />,
    resource: <BookOpen size={16} className="mr-1" />,
    announcement: <Pin size={16} className="mr-1" />,
    assignment: <GraduationCap size={16} className="mr-1" />
  };
  return icons[type] || null;
};

const getDifficultyColor = (level) => {
  const colors = {
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'red'
  };
  return colors[level] || 'gray';
};

export default function PostDetail() {
  const { communityId, postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReaction, setUserReaction] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get(`/community/communities/${communityId}/posts/${postId}`);
        
        if (!response.data?.data) {
          throw new Error('Post not found');
        }
  
        setPost(response.data.data);
        
        if (user?.userId) {
          const reactionResponse = await api.get(`/community/communities/posts/${postId}/user-reaction`);
          setUserReaction(reactionResponse.data.data.reactionType || null);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load post');
        console.error('Fetch post error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [communityId, postId, user?.userId]);

  const updateReactionCount = (prevStats, reactionType, operation = '+') => {
    const stats = prevStats || {};
    const reactions = stats.reactions || {};
    const currentCount = reactions[reactionType] || 0;
    
    return {
      ...stats,
      reactions: {
        ...reactions,
        [reactionType]: operation === '+' 
          ? currentCount + 1 
          : Math.max(0, currentCount - 1)
      }
    };
  };

  const handleReaction = async (reactionType) => {
    try {
      if (!user?.userId) {
        navigate('/login');
        return;
      }
  
      if (userReaction === reactionType) {
        await api.post(`/community/communities/posts/${postId}/unreact`, { reactionType });
        setPost(prev => ({ ...prev, stats: updateReactionCount(prev.stats, reactionType, '-') }));
        setUserReaction(null);
      } 
      else if (userReaction) {
        await api.post(`/community/communities/posts/${postId}/unreact`, { reactionType: userReaction });
        await api.post(`/community/communities/posts/${postId}/react`, { reactionType });
        
        setPost(prev => ({
          ...prev,
          stats: updateReactionCount(
            updateReactionCount(prev.stats, userReaction, '-'), 
            reactionType, '+'
          )
        }));
        setUserReaction(reactionType);
      } 
      else {
        await api.post(`/community/communities/posts/${postId}/react`, { reactionType });
        setPost(prev => ({ ...prev, stats: updateReactionCount(prev.stats, reactionType, '+') }));
        setUserReaction(reactionType);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reaction');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/community/communities/${communityId}/posts/${postId}`);
      navigate(`/communities/${communityId}`, { state: { message: 'Post deleted successfully' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEdit = () => {
    navigate(`/communities/${communityId}/posts/${postId}/edit`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleReport = () => {
    navigate(`/report?type=post&id=${postId}`);
  };

  if (loading) return <LoadingSpinner className="my-8" />;
  if (error) return <ErrorMessage message={error} className="my-8" />;
  if (!post) return <EmptyState title="Post not found" icon="alert-triangle" />;

  const isAuthor = user?.userId === post.author.userId;
  const isAdminOrModerator = user?.role === 'admin' || user?.role === 'moderator';
  const canEdit = isAuthor || isAdminOrModerator;
  const canDelete = isAuthor || isAdminOrModerator;

  const dropdownActions = [
    canEdit && {
      label: 'Edit Post',
      icon: <FiEdit2 className="mr-2" />,
      action: handleEdit
    },
    {
      label: 'Share Post',
      icon: <FiShare2 className="mr-2" />,
      action: handleShare
    },
    {
      label: 'Report Post',
      icon: <FiFlag className="mr-2" />,
      action: handleReport,
      danger: true
    },
    canDelete && {
      label: 'Delete Post',
      icon: <FiTrash2 className="mr-2" />,
      action: handleDelete,
      danger: true
    }
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          to={`/communities/${communityId}`}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to community
        </Link>

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {post.title}
              {post.isOriginalContent && (
                <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  Original Content
                </span>
              )}
            </h1>
            
            {/* Metadata row */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Avatar 
                  src={post.author.avatarUrl} 
                  alt={post.author.username}
                  size="xs"
                  className="mr-2"
                />
                <Link 
                  to={`/users/${post.author.username}`}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {post.author.username}
                </Link>
              </div>
              
              <span>•</span>
              
              <TimeAgo date={post.createdAt} />
              
              {post.updatedAt > post.createdAt && (
                <>
                  <span>•</span>
                  <button 
                    onClick={() => setShowEditHistory(!showEditHistory)}
                    className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <FiClock className="mr-1" />
                    <span>Edited</span>
                  </button>
                </>
              )}
              
              {post.isPinned && (
                <>
                  <span>•</span>
                  <Badge color="indigo">
                    <Pin className="inline mr-1" size={12} />
                    Pinned
                  </Badge>
                </>
              )}
              
              {post.postType && (
                <>
                  <span>•</span>
                  <Badge color="blue">
                    {getPostTypeIcon(post.postType)}
                    {post.postType}
                  </Badge>
                </>
              )}
              
              {post.difficultyLevel && (
                <>
                  <span>•</span>
                  <Badge color={getDifficultyColor(post.difficultyLevel)}>
                    {post.difficultyLevel}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {dropdownActions.length > 0 && (
            <Dropdown
              trigger={
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiMoreVertical />
                </button>
              }
              items={dropdownActions}
              align="right"
            />
          )}
        </div>
      </div>

      {/* Edit History */}
      {showEditHistory && post.editHistory?.length > 0 && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Edit History</h3>
          <ul className="space-y-2 text-sm">
            {post.editHistory.map((edit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 mr-2">•</span>
                <div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Edited by {edit.editedBy || 'unknown'} on {new Date(edit.timestamp).toLocaleString()}
                  </div>
                  {edit.reason && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      Reason: {edit.reason}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source URL */}
      {post.sourceUrl && (
        <div className="mb-6">
          <a 
            href={post.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <FiExternalLink className="mr-1" />
            View External Source
          </a>
        </div>
      )}

      {/* Main Content */}
      <article className="prose dark:prose-invert max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {/* Tags */}
      {/* {post.tags?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/communities/${communityId}?tag=${tag}`}
              className="inline-block"
            >
              <Badge color="gray">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )} */}

      {/* Stats and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-4">
            <FiEye />
            <span>{post.stats.viewCount || 0} views</span>
          </div>
          
          <ReactionButton
            currentReaction={userReaction}
            count={Object.values(post?.stats?.reactions || {}).reduce((a, b) => a + b, 0)}
            onClick={handleReaction}
          />
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 ml-4">
            <FiMessageSquare />
            <span>{post?.stats?.commentCount || 0} comments</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <FiShare2 className="mr-2" />
            Share
          </Button>
          {!isAuthor && (
            <Button variant="outline" onClick={handleReport}>
              <FiFlag className="mr-2" />
              Report
            </Button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection 
        communityId={communityId}
        postId={postId}
        currentUser={user}
      />
    </div>
  );
}