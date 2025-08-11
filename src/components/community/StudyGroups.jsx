import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { AlertTriangle, Users } from 'lucide-react';
import StudyGroupCard from './StudyGroupCard';

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
        
        // Abordagem defensiva para diferentes formatos de resposta
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
        console.error('Error fetching study groups:', err);
        setError(err.response?.data?.message || 
                err.message || 
                'Failed to load study groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchGroups();
    } else {
      setError('Invalid community identifier');
      setLoading(false);
    }
  }, [communityId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" message={error} icon={AlertTriangle} />;

  const hasGroups = Array.isArray(groups) && groups.length > 0;
  if (!hasGroups) {
    return (
      <EmptyState
        title="No study groups yet"
        message={isMember ? 
          "Be the first to create one!" : 
          "Join the community to participate in study groups."}
        icon={Users}
      />
    );
  }

  // Renderização principal
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        if (!group?.groupId) {
          console.warn('Invalid group data:', group);
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