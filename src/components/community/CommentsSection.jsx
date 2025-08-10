import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FiMessageSquare, FiSend, FiTrash2, FiEdit2 } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Avatar from '../../components/common/Avatar';
import TimeAgo from '../common/TimeAgo';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

/**
 * @typedef {Object} Comment
 * @property {string} commentId - ID do comentário
 * @property {string} content - Conteúdo
 * @property {Object} author - Autor
 * @property {string} author.userId - ID do autor
 * @property {string} author.username - Nome do autor
 * @property {string} author.avatarUrl - Avatar do autor
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data de atualização
 */

export default function CommentsSection({ communityId, postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/community/communities/posts/${postId}/comments`);
      const commentsData = response.data?.data?.comments || [];

      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newComment.trim()) return;

      if (editingCommentId) {
        await api.put(`/community/communities/posts/${postId}/comments/${editingCommentId}`, {
          content: newComment
        });
      } else {
        await api.post(`/community/communities/posts/${postId}/comments`, {
          content: newComment
        });
      }

      setNewComment('');
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment');
    }
  };

  const handleEdit = (comment) => {
    if (!comment) return;
    setEditingCommentId(comment.commentId || null);
    setNewComment(comment.content || '');
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await api.delete(`/community/communities/posts/${postId}/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const getSafeAuthor = (author) => ({
    userId: author?.userId || 'unknown',
    username: author?.username || 'Unknown',
    avatarUrl: author?.avatarUrl || '',
  });

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FiMessageSquare className="text-indigo-600 dark:text-indigo-400" />
        Discussion ({(Array.isArray(comments) ? comments.length : 0)})
      </h2>

      {currentUser && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar 
            src={currentUser?.avatarUrl} 
            alt={currentUser?.username || 'User'}
            size="sm"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              rows={3}
              required
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                icon={<FiSend />}
              >
                {editingCommentId ? 'Update Comment' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner className="my-8" />
      ) : !Array.isArray(comments) || comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => {
            if (!comment) return null;
            
            const safeAuthor = getSafeAuthor(comment.author);
            const isAuthor = currentUser?.userId === safeAuthor.userId;
            const canEdit = isAuthor;
            const canDelete = isAuthor || currentUser?.role === 'admin';

            return (
              <div
                key={comment.commentId || Math.random()}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={safeAuthor.avatarUrl} 
                      alt={safeAuthor.username}
                      size="sm"
                    />
                    <div>
                      <Link 
                        to={`/users/${safeAuthor.username}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {safeAuthor.username}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.createdAt && <TimeAgo date={comment.createdAt} />}
                        {comment.updatedAt && comment.createdAt && comment.updatedAt > comment.createdAt && (
                          <span className="ml-2">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                      {canEdit && (
                        <button 
                          onClick={() => handleEdit(comment)}
                          className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(comment.commentId)}
                          className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 pl-11">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {comment.content || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}