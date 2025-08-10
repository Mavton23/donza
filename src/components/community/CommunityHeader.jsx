import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Icon from '../common/Icon';
import Dropdown from '../common/Dropdown';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CommunityHeader({ community, isMember, onJoin, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLeaveCommunity = async () => {
    try {
      setLoading(true);
      await api.post(`/community/communities/${community.communityId}/leave`);
      onUpdate({ membersCount: community.membersCount - 1 });
      navigate('/communities');
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível sair da comunidade');
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    {
      label: 'Editar Comunidade',
      icon: 'edit',
      action: () => navigate(`/communities/${community.communityId}/edit`)
    },
    {
      label: 'Gerenciar Membros',
      icon: 'users',
      action: () => navigate(`/communities/${community.communityId}/members`)
    },
    {
      label: 'Excluir Comunidade',
      icon: 'trash-2',
      action: () => console.log('Excluir comunidade', community.communityId),
      danger: true
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
        {community.coverImage && (
          <img
            src={community.coverImage || '/images/thumbnail-placeholder.svg'}
            alt="Capa da comunidade"
            className="w-full h-full object-cover"
          />
        )}

        {(user?.userId === community.creatorId || user?.role === 'admin') && (
          <div className="absolute top-4 right-4 z-10">
            <Dropdown
              trigger={
                <button className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <Icon name="settings" />
                </button>
              }
              items={adminActions}
              position="left"
            />
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-4 relative">
        <div className="absolute -top-12 left-6 z-10">
          <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center overflow-hidden">
            {community.avatarUrl ? (
              <img 
                src={community.avatarUrl || '/images/placeholder.png'} 
                alt={community.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon name="users" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-4">
          <div className="md:col-span-2">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.name}
              </h1>
              
              <div className="text-gray-600 dark:text-gray-300">
                <div dangerouslySetInnerHTML={{ __html: community.description }} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Icon name="Users" className="mr-2 flex-shrink-0" />
                  <span>{community.stats.totalMembers || 0} membros</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Icon name="Newspaper" className="mr-2 flex-shrink-0" />
                  <span>{community.stats.totalPosts || 0} publicações</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Icon name="Book" className="mr-2 flex-shrink-0" />
                  <span>{community.stats.totalGroups || 0} grupos</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Icon name="calendar" className="mr-2 flex-shrink-0" />
                  <span>Desde {new Date(community.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center">
                  {community.isPublic ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <Icon name="globe" className="mr-2 flex-shrink-0" />
                      Pública
                    </span>
                  ) : (
                    <span className="text-indigo-600 dark:text-indigo-400 flex items-center">
                      <Icon name="lock" className="mr-2 flex-shrink-0" />
                      Privada
                    </span>
                  )}
                </div>
              </div>
            </div>

            {community.rules && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 transition-all duration-200">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Regras da Comunidade
                    </h3>
                    <Icon 
                      name="chevron-down" 
                      className="h-5 w-5 text-gray-500 group-open:rotate-180 transform transition-transform" 
                    />
                  </summary>

                  <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300 animate-fadeIn">
                    {community.rules.guidelines && (
                      <div>
                        <h4 className="font-medium">Diretrizes:</h4>
                        <p className="whitespace-pre-line mt-1">{community.rules.guidelines}</p>
                      </div>
                    )}
                    {community.rules.allowedContent && (
                      <div>
                        <h4 className="font-medium">Conteúdo Permitido:</h4>
                        <p className="whitespace-pre-line mt-1">{community.rules.allowedContent}</p>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {!isMember ? (
              <button
                onClick={onJoin}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Icon name="plus" />}
                Entrar na Comunidade
              </button>
            ) : (
              <>
                <Link
                  to={`/communities/${community.communityId}/create-post`}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="edit" size="sm" />
                  Criar Publicação
                </Link>
                <Link
                  to={user.status === 'pending' ? '#' : `/communities/${community.communityId}/create-group`}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="plus" size="sm" />
                  Grupo de Estudo
                  {user?.status === 'pending' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                      Pendente
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLeaveCommunity}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <Icon name="log-out" size="sm" />}
                  Sair da Comunidade
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
