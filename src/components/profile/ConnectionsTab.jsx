import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function ConnectionsTab({ userId, isOwnProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('followers');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowingMap, setIsFollowingMap] = useState({});

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const endpoint = activeSubTab === 'followers' 
          ? `/users/${userId}/followers` 
          : `/users/${userId}/following`;
        
        const { data } = await api.get(endpoint);
        setConnections(data);

        if (activeSubTab === 'following') {
          const followingStatus = {};
          for (const user of data) {
            const { data: status } = await api.get(`/users/follow-status/${user.userId}`);
            followingStatus[user.userId] = status.isFollowing;
          }
          setIsFollowingMap(followingStatus);
        }
      } catch (err) {
        toast.error('Erro ao carregar conexões');
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [userId, activeSubTab]);

  const handleFollowToggle = async (targetUserId) => {
    try {
      const wasFollowing = isFollowingMap[targetUserId];
      
      if (wasFollowing) {
        await api.delete(`/users/follow/${targetUserId}`);
      } else {
        await api.post(`/users/follow/${targetUserId}`);
      }

      setIsFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !wasFollowing
      }));

      toast.success(wasFollowing ? 'Deixou de seguir' : 'Agora você está seguindo');
    } catch (err) {
      toast.error('Erro ao atualizar status de seguimento');
      console.error('Error toggling follow:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium flex items-center ${activeSubTab === 'followers' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveSubTab('followers')}
        >
          <Users className="h-5 w-5 mr-2" />
          Seguidores
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center ${activeSubTab === 'following' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveSubTab('following')}
        >
          <UserCheck className="h-5 w-5 mr-2" />
          Seguindo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {activeSubTab === 'followers' 
                  ? 'Nenhum seguidor encontrado' 
                  : 'Não está seguindo ninguém'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {connections.map(user => (
                <li key={user.userId} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                        <img 
                          src={user.avatarUrl || '/images/placeholder.png'} 
                          alt={user.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </Link>
                      <div>
                        <Link 
                          to={`/profile/${user.username}`} 
                          className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {user.fullName || user.username}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!isOwnProfile && activeSubTab === 'following' && (
                      <button
                        onClick={() => handleFollowToggle(user.userId)}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                          isFollowingMap[user.userId]
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isFollowingMap[user.userId] ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Seguindo
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Seguir
                          </>
                        )}
                      </button>
                    )}
                    
                    {isOwnProfile && activeSubTab === 'following' && (
                      <button
                        onClick={() => handleFollowToggle(user.userId)}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Deixar de seguir
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}