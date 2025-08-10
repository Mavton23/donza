import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunityPosts from '@/components/community/CommunityPosts';
import CommunityMembers from '@/components/community/CommunityMembers';
import StudyGroups from '@/components/community/StudyGroups';
import CommunityRules from '@/components/community/CommunityRules';
import CommunitySettings from './CommunitySettings';
import TabNavigation from '@/components/profile/TabNavigation';
import { FiUsers, FiMessageSquare, FiBook, FiShield, FiSettings } from 'react-icons/fi';

export default function CommunityDetail() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [communityRes, membershipRes] = await Promise.all([
          api.get(`/community/communities/${communityId}`),
          user ? api.get(`/community/communities/${communityId}/membership`) : Promise.resolve(null)
        ]);

        setCommunity(communityRes.data.data);
        setUserRole(membershipRes?.data?.role || null);
      } catch (err) {
        console.error('Erro ao carregar comunidade:', err);
        setError(err.response?.data?.message || 'Falha ao carregar comunidade');
        navigate('/communities', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityId, user, navigate]);

  const handleJoinCommunity = async () => {
    try {
      const response = await api.post(`/community/communities/${communityId}/join`);
      setUserRole(response.data.role);
      
      // Atualiza contagem de membros
      setCommunity(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          members: prev.stats.members + 1
        }
      }));
    } catch (err) {
      console.error('Erro ao entrar na comunidade:', err);
      setError(err.response?.data?.message || 'Falha ao entrar na comunidade');
    }
  };

  const handleTabChange = (tab) => {
    // Verifica acesso para abas restritas
    if ((tab === 'settings' && userRole !== 'admin')) {
      setError('Você precisa de privilégios de administrador para acessar as configurações');
      return;
    }
    setActiveTab(tab);
    setError(null);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!community) return <ErrorState message="Comunidade não encontrada" />;

  const tabs = [
    { id: 'posts', label: 'Publicações', icon: FiMessageSquare },
    { id: 'members', label: 'Membros', icon: FiUsers },
    { id: 'groups', label: 'Grupos de Estudo', icon: FiBook },
    { id: 'rules', label: 'Regras', icon: FiShield },
    ...(userRole === 'admin' ? [
      { id: 'settings', label: 'Configurações', icon: FiSettings }
    ] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CommunityHeader 
        community={community}
        userRole={userRole}
        onJoin={handleJoinCommunity}
        isMember={community.isMember}
      />

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        tabs={tabs}
      />

      <div className="mt-6">
        {error && (
          <div className="mb-4">
            <ErrorState message={error} /> 
          </div>
        )}

        {activeTab === 'posts' && (
          <CommunityPosts 
            communityId={communityId}
            userRole={userRole}
            isPublic={community.isPublic}
          />
        )}
        
        {activeTab === 'members' && (
          <CommunityMembers 
            communityId={communityId}
            membershipType={community.membershipType}
            userRole={userRole}
          />
        )}
        
        {activeTab === 'groups' && (
          <StudyGroups
            communityId={communityId}
            userRole={userRole}
            isPublic={community.isPublic}
            isMember={community.isMember}
          />
        )}
        
        {activeTab === 'rules' && (
          <CommunityRules 
            rules={community.rules}
            communityId={communityId}
            userRole={userRole}
          />
        )}
        
        {activeTab === 'settings' && userRole === 'admin' && (
          <CommunitySettings 
            community={community}
            onUpdate={(updated) => setCommunity(prev => ({ ...prev, ...updated }))}
          />
        )}
      </div>
    </div>
  );
}