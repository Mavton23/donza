import { Link } from 'react-router-dom';
import { Tooltip } from '../ui/tooltip';
import { FiUsers, FiMessageSquare, FiLock, FiGlobe, FiUser } from 'react-icons/fi';
import TimeAgo from '../common/TimeAgo';


/**
 * @typedef {Object} CommunityCardProps
 * @property {Object} community - Dados da comunidade
 * @property {string} community.communityId - ID da comunidade
 * @property {string} community.name - Nome da comunidade
 * @property {string} community.description - Descrição
 * @property {string} community.shortDescription - Descrição curta
 * @property {string} community.coverImage - URL da imagem de capa
 * @property {string} community.thumbnailImage - URL da miniatura
 * @property {boolean} community.isPublic - Se é pública
 * @property {string} community.membershipType - Tipo de associação
 * @property {Object} community.creator - Criador
 * @property {string} community.creator.username - Nome do criador
 * @property {string} community.creator.avatarUrl - Avatar do criador
 * @property {Object} community.stats - Estatísticas
 * @property {number} community.stats.members - Número de membros
 * @property {number} community.stats.posts - Número de posts
 * @property {Date} community.createdAt - Data de criação
 * @property {string[]} [community.tags] - Tags da comunidade
 */

export default function CommunityCard({ community }) {
  const {
    communityId = '',
    name = 'Unnamed Community',
    shortDescription = '',
    description = '',
    coverImage = null,
    thumbnailImage = null,
    isPublic = true,
    membershipType = 'open',
    creator = {},
    stats = {},
    createdAt = new Date().toISOString(),
    tags = [],
    rules = {}
  } = community || {};
  
  // Valores derivados com fallbacks
  const creatorUsername = creator?.username || 'Unknown';
  const creatorAvatar = creator?.avatarUrl || null;
  const membersCount = Math.max(0, parseInt(stats?.members)) || 0;
  const postsCount = Math.max(0, parseInt(stats?.posts)) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      {/* Cabeçalho com imagem */}
      <Link to={`/communities/${communityId}`} className="block">
        <div className="h-48 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          {coverImage ? (
            <img
              loading="lazy"
              src={coverImage}
              alt={`${name} cover`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-community-cover.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiUsers className="w-12 h-12" />
            </div>
          )}
          
          {/* Badge de status */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <Tooltip content={isPublic ? 'Public community' : 'Private community'}>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPublic 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}>
                {isPublic ? <FiGlobe className="mr-1" /> : <FiLock className="mr-1" />}
                {isPublic ? 'Public' : 'Private'}
              </span>
            </Tooltip>
            
            <Tooltip content={`Membership type: ${membershipType.replace('_', ' ')}`}>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {membershipType === 'open' ? 'Open' : 
                 membershipType === 'approval' ? 'Approval' : 'Invite only'}
              </span>
            </Tooltip>
          </div>
        </div>
      </Link>

      {/* Corpo do card */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link 
            to={`/communities/${communityId}`}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
          >
            {name}
          </Link>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2">
          {shortDescription || 'No description provided'}
        </p>

        {/* Estatísticas */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiUsers className="mr-1.5 flex-shrink-0" />
            <span>
              {membersCount.toLocaleString()} {membersCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiMessageSquare className="mr-1.5 flex-shrink-0" />
            <span>
              {postsCount.toLocaleString()} {postsCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            {creatorAvatar ? (
              <img 
                src={creatorAvatar} 
                alt={creatorUsername}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2 flex items-center justify-center">
                <FiUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Criado por <span className="text-indigo-600 dark:text-indigo-400">{creatorUsername}</span>
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <TimeAgo 
              date={createdAt}
              className="text-xs text-gray-500 flex-shrink-0"
            />
          </span>
        </div>
      </div>
    </div>
  );
}