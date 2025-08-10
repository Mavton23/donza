import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUser, FiUserX } from 'react-icons/fi';
import Avatar from '../../components/common/Avatar';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MemberList({ groupId, members = [], currentUserId, canManage }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberList, setMemberList] = useState(members);

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/community/study-groups/${groupId}/members/${memberId}`);
      setMemberList(prev => prev.filter(m => m.userId !== memberId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMemberList(members);
  }, [members]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <FiUser className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Members ({memberList.length})
        </h2>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="sm" className="my-4" />
      ) : (
        <div className="space-y-3">
          {memberList.map(member => (
            <div key={member.userId} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={member.avatarUrl} 
                  alt={member.username}
                  size="sm"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {member.username}
                    {member.userId === currentUserId && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {member.role}
                  </div>
                </div>
              </div>

              {canManage && member.userId !== currentUserId && (
                <button 
                  onClick={() => handleRemoveMember(member.userId)}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  title="Remove member"
                >
                  <FiUserX size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}