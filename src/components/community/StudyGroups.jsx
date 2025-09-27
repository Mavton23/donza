import { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { AlertTriangle, Users } from 'lucide-react';
import StudyGroupCard from './StudyGroupCard';
import { toast } from 'sonner';

export default function StudyGroups({ communityId, isMember, userRole, isPublic }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/groups/${communityId}/groups`);
        
        let groupsData = [];
        if (response.data?.success) {
          groupsData = response.data.data?.groups || [];
        } else if (Array.isArray(response.data)) {
          groupsData = response.data;
        } else if (response.data?.groups) {
          groupsData = response.data.groups;
        }

        setGroups(groupsData);
      } catch (err) {
        console.error('Erro ao buscar grupos de estudo:', err);
        setError(err.response?.data?.message || 
                err.message || 
                'Falha ao carregar grupos de estudo. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchGroups();
    } else {
      setError('Identificador de comunidade inválido');
      setLoading(false);
    }
  }, [communityId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Erro" message={error} icon={AlertTriangle} />;

  const hasGroups = Array.isArray(groups) && groups.length > 0;
  if (!hasGroups) {
    return (
      <EmptyState
        title="Nenhum grupo de estudo ainda"
        message={isMember ? 
          "Seja o primeiro a criar um!" : 
          "Entre na comunidade para participar dos grupos de estudo."}
        icon={Users}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        if (!group?.groupId) {
          toast.warning('Dados inválidos do grupo:', group);
          return null;
        }
        
        return (
          <StudyGroupCard
            key={group.groupId}
            group={group}
            communityId={communityId}
            isMember={isMember}
          />
        );
      })}
    </div>
  );
}
