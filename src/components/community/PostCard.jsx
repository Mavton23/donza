import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiTrash2, FiMessageSquare, FiHeart, FiMoreVertical, FiExternalLink, FiThumbsUp, FiAward, FiEdit3 } from 'react-icons/fi';
import { Pin, BookOpen, AlertCircle, GraduationCap } from 'lucide-react';
import Dropdown from '@/components/common/Dropdown';
import PostDetail from './PostDetail';
import Avatar from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import TimeAgo from '../common/TimeAgo';

const getPostTypeColor = (type) => {
  const colors = {
    discussion: 'blue',
    question: 'red',
    resource: 'green',
    announcement: 'purple',
    assignment: 'orange'
  };
  return colors[type] || 'gray';
};

const getPostTypeIcon = (type) => {
  const icons = {
    discussion: <BookOpen size={14} className="mr-1" />,
    question: <AlertCircle size={14} className="mr-1" />,
    resource: <BookOpen size={14} className="mr-1" />,
    announcement: <Pin size={14} className="mr-1" />,
    assignment: <GraduationCap size={14} className="mr-1" />
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

const getTotalReactions = (reactions) => {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((total, count) => total + count, 0);
};

export default function PostCard({ 
  post, 
  communityId, 
  onDelete, 
  currentUserId 
}) {
  const navigate = useNavigate();
  const isAuthor = currentUserId === post.author.userId;
  const canDelete = onDelete && (isAuthor || post.author.role === 'admin');

  const actions = [
    {
      label: 'View Post',
      icon: <FiEye className="mr-2" />,
      action: () => navigate(`/communities/${communityId}/posts/${post.postId}`)
    },
    canDelete && {
      label: 'Delete Post',
      icon: <FiTrash2 className="mr-2" />,
      action: () => onDelete(post.postId),
      danger: true
    }
  ].filter(Boolean);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border ${
      post.isPinned 
        ? 'border-indigo-500 dark:border-indigo-400' 
        : 'border-gray-100 dark:border-gray-700'
    }`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <Avatar 
            src={post.author.avatarUrl} 
            alt={post.author.username}
            size="sm"
          />
          <div>
            <Link 
              to={`/profile/${post.author.username}`}
              className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {post.author.username}
            </Link>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                <TimeAgo date={post.createdAt} />
              </span>
              {post.isPinned && (
                <Badge color="indigo" className="ml-2">
                  <Pin className="inline mr-1" size={12} />
                  Pinned
                </Badge>
              )}
              {post.postType && (
                <Badge color={getPostTypeColor(post.postType)} className="ml-2">
                  {getPostTypeIcon(post.postType)}
                  {post.postType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {actions.length > 0 && (
          <Dropdown
            trigger={
              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FiMoreVertical />
              </button>
            }
            items={actions}
            align="right"
          />
        )}
      </div>

      <Link to={`/communities/${communityId}/posts/${post.postId}`} className="block">
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
          {post.title}
          {post.isOriginalContent && (
            <span className="text-xs text-green-600 dark:text-green-400 ml-2">
              Original Content
            </span>
          )}
        </h3>
      </Link>

      <div 
        className="mt-2 prose dark:prose-invert prose-sm max-w-none line-clamp-3"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.sourceUrl && (
        <div className="mt-2">
          <a 
            href={post.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <FiExternalLink className="mr-1" size={12} />
            View Source
          </a>
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <Badge key={tag} color="gray">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {post.difficultyLevel && (
        <div className="mt-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Difficulty: 
          </span>
          <Badge color={getDifficultyColor(post.difficultyLevel)} className="ml-1">
            {post.difficultyLevel}
          </Badge>
        </div>
      )}

<div className="mt-4 flex items-center gap-4 text-sm">
  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
    <FiEye size={16} />
    {post.stats?.viewCount || 0}
  </div>
  <Link 
    to={`/communities/${communityId}/posts/${post.postId}`}
    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
  >
    <FiMessageSquare size={16} />
    {post.stats?.commentCount || 0}
  </Link>
  <div className="flex items-center gap-2">
    <div className="flex -space-x-1">
      {post.stats?.reactions && Object.entries(post.stats.reactions)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => (
          <div 
            key={type} 
            className="relative h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-white dark:border-gray-800 flex items-center justify-center text-xs"
            title={`${count} ${type}`}
          >
            {type === 'like' && <FiHeart className="text-red-500" size={12} />}
            {type === 'helpful' && <FiThumbsUp className="text-blue-500" size={12} />}
            {type === 'celebrate' && <FiAward className="text-yellow-500" size={12} />}
            {type === 'creative' && <FiEdit3 className="text-purple-500" size={12} />}
            {count > 0 && (
              <span className="absolute -bottom-1 -right-1 text-[10px] bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full h-4 w-4 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                {count}
              </span>
            )}
          </div>
        ))}
    </div>
    <span className="text-gray-500 dark:text-gray-400">
      {getTotalReactions(post.stats?.reactions)} reactions
    </span>
  </div>
</div>
    </div>
  );
}