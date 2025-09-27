import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunityPosts from '@/components/community/CommunityPosts';
import CommunityMembers from '@/components/community/CommunityMembers';
import StudyGroups from '@/components/community/StudyGroups';
import CommunityRules from '@/components/community/CommunityRules';
import CommunityChatRoom from './CommunityChatRoom';
import CommunitySettings from './CommunitySettings';
import TabNavigation from '@/components/profile/TabNavigation';
import { FiUsers, FiMessageSquare, FiBook, FiShield, FiSettings, FiMessageCircle } from 'react-icons/fi';

export default function CommunityDetail() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        
        const [communityRes, membershipRes] = await Promise.all([
          api.get(`/community/communities/${communityId}`),
          user ? api.get(`/community/communities/${communityId}/membership`) : Promise.resolve(null)
        ]);

        setCommunity(communityRes.data.data);
        setUserRole(membershipRes?.data?.role || null);
      } catch (err) {
        console.error('Erro ao carregar comunidade:', err);
        const errorMessage = err.response?.data?.message || 'Falha ao carregar comunidade';
        toast.error(errorMessage);
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
        isMember: true,
        stats: {
          ...prev.stats,
          members: prev.stats.members + 1
        }
      }));

      toast.success('Você entrou na comunidade com sucesso!');
    } catch (err) {
      console.error('Erro ao entrar na comunidade:', err);
      const errorMessage = err.response?.data?.message || 'Falha ao entrar na comunidade';
      toast.error(errorMessage);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await api.post(`/community/communities/${community.communityId}/leave`);
      
      // Atualiza o estado local imediatamente
      setCommunity(prev => ({
        ...prev,
        isMember: false,
        stats: {
          ...prev.stats,
          members: Math.max(0, prev.stats.members - 1)
        }
      }));
      
      setUserRole(null);
      
      toast.success('Você saiu da comunidade com sucesso!');
      
    } catch (err) {
      console.error('Erro ao sair da comunidade:', err);
      const errorMessage = err.response?.data?.message || 'Falha ao sair da comunidade';
      toast.error(errorMessage);
    }
  };

  const handleTabChange = (tab) => {
    // Verifica acesso para abas restritas
    if (tab === 'settings' && userRole !== 'admin') {
      toast.error('Você precisa de privilégios de administrador para acessar as configurações');
      return;
    }
    
    setActiveTab(tab);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!community) {
    toast.error('Comunidade não encontrada');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Comunidade não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            A comunidade que você está procurando não existe ou foi removida.
          </p>
          <button
            onClick={() => navigate('/communities')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Voltar para comunidades
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', label: 'Publicações', icon: FiMessageSquare },
    { id: 'chat', label: 'Chat', icon: FiMessageCircle },
    { id: 'members', label: 'Membros', icon: FiUsers },
    { id: 'groups', label: 'Grupos', icon: FiBook },
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
        onLeave={handleLeaveCommunity}
        onUpdate={(updated) => setCommunity(prev => ({ ...prev, ...updated }))}
      />

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        tabs={tabs}
      />

      <div className="mt-6">
        {activeTab === 'posts' && (
          <CommunityPosts 
            communityId={communityId}
            userRole={userRole}
            isPublic={community.isPublic}
          />
        )}

        {activeTab === 'chat' && (
          <CommunityChatRoom 
            communityId={communityId}
            userRole={userRole}
            isMember={community.isMember}
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