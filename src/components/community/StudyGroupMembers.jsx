import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import MemberCard from '../community/MemberCard';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';

export default function StudyGroupMembers({ groupId, isLeader }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/study-groups/${groupId}/members`);
      setMembers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/study-groups/${groupId}/members/${userId}/role`, { role: newRole });
      setMembers(members.map(member => 
        member.user.userId === userId ? { ...member, role: newRole } : member
      ));
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    try {
      await api.delete(`/study-groups/${groupId}/members/${memberToRemove.userId}`);
      setMembers(members.filter(m => m.user.userId !== memberToRemove.userId));
      setMemberToRemove(null);
    } catch (err) {
      setError('Failed to remove member');
    } finally {
      setShowConfirmation(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" message={error} icon="alert-triangle" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Group Members ({members.length})
        </h3>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          message="Invite people to join this study group!"
          icon="users"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.membershipId}
              member={member}
              onRoleChange={(userId, role) => handleRoleChange(userId, role)}
              onRemove={(userId) => {
                setMemberToRemove({ userId, name: member.user.username });
                setShowConfirmation(true);
              }}
              canModerate={isLeader}
              roleOptions={[
                { value: 'member', label: 'Member' },
                { value: 'co-leader', label: 'Co-Leader' },
                ...(isLeader ? [{ value: 'leader', label: 'Leader' }] : []),
              ]}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from the group?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}