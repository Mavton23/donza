import { Link } from 'react-router-dom';
import { FiUser, FiMoreVertical, FiUserX, FiMessageSquare, FiEdit2 } from 'react-icons/fi';
import Dropdown from '@/components/common/Dropdown';
import Avatar from '@/components/common/Avatar';
import TimeAgo from '../common/TimeAgo';

/**
 * @typedef {Object} MemberCardProps
 * @property {Object} member - Dados do membro
 * @property {string} member.memberId - ID da associação
 * @property {string} member.role - Função na comunidade
 * @property {Date} member.joinedAt - Data de ingresso
 * @property {Object} member.user - Dados do usuário
 * @property {string} member.user.userId - ID do usuário
 * @property {string} member.user.username - Nome de usuário
 * @property {string} member.user.avatarUrl - URL do avatar
 * @property {Object} member.stats - Estatísticas
 * @property {number} member.stats.postCount - Número de posts
 * @property {number} member.stats.commentCount - Número de comentários
 * @property {function} [onRoleChange] - Callback para mudança de função
 * @property {function} [onRemove] - Callback para remoção
 * @property {string} [currentUserId] - ID do usuário atual
 */

export default function MemberCard({ 
  member = {
    memberId: '',
    role: 'member',
    joinedAt: new Date().toISOString(),
    user: {
      userId: '',
      username: 'Unknown',
      avatarUrl: null
    },
    stats: {
      postCount: 0,
      commentCount: 0
    }
  }, 
  onRoleChange, 
  onRemove, 
  currentUserId 
}) {
  const safeMember = {
    ...member,
    user: member.user || {
      userId: '',
      username: 'Unknown',
      avatarUrl: null
    },
    stats: member.stats || {
      postCount: 0,
      commentCount: 0
    }
  };

  const isCurrentUser = currentUserId === safeMember.user.userId;
  const canChangeRole = onRoleChange && !isCurrentUser;
  const canRemove = onRemove && !isCurrentUser && safeMember.role !== 'admin';

  const actions = [
    {
      label: 'View Profile',
      icon: <FiUser className="mr-2 h-4 w-4" />,
      action: () => window.open(`/profile/${safeMember.user.username}`, '_blank')
    },
    canChangeRole && {
      label: 'Change Role',
      icon: <FiEdit2 className="mr-2 h-4 w-4" />,
      action: () => {}
    },
    canRemove && {
      label: 'Remove Member',
      icon: <FiUserX className="mr-2 h-4 w-4" />,
      action: () => onRemove(safeMember.memberId),
      danger: true
    }
  ].filter(Boolean);

  const roleColors = {
    admin: 'bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white',
    moderator: 'bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white',
    member: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  };

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 last:mb-0">
      <div className="p-5">
        <div className="flex flex-col gap-4">
          {/* Top Section - Avatar and Basic Info */}
          <div className="flex items-start justify-between gap-4">
            <Link to={`/profile/${safeMember.user.username}`} className="flex items-center gap-3 group">
              <Avatar 
                src={safeMember.user.avatarUrl} 
                alt={safeMember.user.username}
                size="lg"
                className="group-hover:ring-2 group-hover:ring-indigo-500 dark:group-hover:ring-indigo-400 transition-all duration-200 flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">
                  {safeMember.user.username}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(You)</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Joined <TimeAgo date={safeMember.joinedAt} />
                </p>
              </div>
            </Link>
            
            {/* Dropdown Menu */}
            {actions.length > 0 && (
              <Dropdown
                trigger={
                  <button 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mt-1"
                    aria-label="Member actions"
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>
                }
                items={actions}
                align="right"
                className="z-10"
              />
            )}
          </div>
          
          {/* Middle Section - Role and Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[safeMember.role]}`}>
              {safeMember.role.charAt(0).toUpperCase() + safeMember.role.slice(1)}
            </span>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FiEdit2 className="mr-1.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span>{safeMember.stats.postCount} posts</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FiMessageSquare className="mr-1.5 h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span>{safeMember.stats.commentCount} comments</span>
            </div>
          </div>
          
          {/* Bottom Section - Role Selector */}
          {canChangeRole && (
            <div className="mt-2">
              <label htmlFor={`role-select-${safeMember.memberId}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Change role
              </label>
              <select
                id={`role-select-${safeMember.memberId}`}
                value={safeMember.role}
                onChange={(e) => onRoleChange(safeMember.memberId, e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
              >
                {roleOptions.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.value === 'admin' && safeMember.role !== 'admin'}
                    className="dark:bg-gray-800"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}