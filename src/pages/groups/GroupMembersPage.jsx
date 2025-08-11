import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiUserX, FiMail, FiChevronDown } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import InviteModal from '@/utils/InviteModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

export default function GroupMembersPage() {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Função para normalizar os dados recebidos da API
  const normalizeApiData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const [membersRes, requestsRes] = await Promise.all([
          api.get(`/groups/${communityId}/${groupId}/members`),
          api.get(`/groups/groups/${groupId}/pending-members`)
        ]);
        
        // Adicionando tratamento defensivo para os dados
        const normalizedMembers = normalizeApiData(membersRes?.data);
        const normalizedRequests = normalizeApiData(requestsRes?.data);
        
        setMembers(normalizedMembers);
        setFilteredMembers(normalizedMembers);
        setPendingRequests(normalizedRequests);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load members');
        navigate(`/communities/${communityId}/groups/${groupId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [communityId, groupId, navigate]);

  useEffect(() => {
    const filtered = members.filter(member =>
      member?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const updateMemberRole = async (userId, newRole) => {
    try {
      await api.patch(`/groups/${groupId}/members/${userId}/role`, { role: newRole });
      setMembers(members.map(m => 
        m?.userId === userId ? { ...m, role: newRole } : m
      ));
      toast.success('Member role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const removeMember = async () => {
    if (!selectedMember?.userId) return;
    
    try {
      await api.delete(`/groups/${groupId}/members/${selectedMember.userId}`);
      setMembers(members.filter(m => m?.userId !== selectedMember.userId));
      setActionModalOpen(false);
      toast.success('Member removed from group');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const inviteMembers = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      toast.warning('No users selected');
      return;
    }
  
  try {
    await api.post(`/groups/groups/${groupId}/invite`, { userIds });
    setInviteModalOpen(false);
    toast.success(`Invitations sent to ${userIds.length} user(s)`);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to send invitations';
    toast.error(errorMessage);
    console.error('Invite error:', err.response?.data || err.message);
  }
};

  const handleJoinRequest = async (requestId, action) => {
    if (!requestId) return;
    
    try {
      await api.patch(`/groups/groups/${groupId}/members/${requestId}/approve`, { action });
      setPendingRequests(pendingRequests.filter(r => r?.requestId !== requestId));
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Group Members Management</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="primary" 
            onClick={() => setInviteModalOpen(true)}
          >
            <FiUserPlus className="mr-2" /> Invite Members
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search members by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<FiSearch />}
        />
      </div>

      {pendingRequests?.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Pending Join Requests ({pendingRequests.length})</h2>
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request?.requestId || Math.random()} className="flex items-center justify-between p-3 border-b dark:border-yellow-800">
                <div className="flex items-center">
                  <Avatar src={request?.user?.avatarUrl} alt={request?.user?.username} size="sm" className="mr-3" />
                  <div>
                    <p className="font-medium">{request?.user?.username || 'Unknown user'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Requested {request?.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'unknown date'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success-outline"
                    size="sm"
                    onClick={() => handleJoinRequest(request?.requestId, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger-outline"
                    size="sm"
                    onClick={() => handleJoinRequest(request?.requestId, 'reject')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMembers?.length > 0 ? (
            filteredMembers.map(member => (
              <div key={member?.userId || Math.random()} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar src={member?.avatarUrl} alt={member?.username} size="md" className="mr-4" />
                    <div>
                      <p className="font-medium">{member?.username || 'Unknown member'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Joined {member?.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          member?.role === 'leader' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : member?.role === 'co-leader' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        } ${member?.role !== 'leader' ? 'cursor-pointer' : ''}`}
                        onClick={() => member?.role !== 'leader' && setSelectedMember({...member, action: 'role'})}
                      >
                        {member?.role || 'member'}
                        {member?.role !== 'leader' && <FiChevronDown className="ml-1" />}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.info(`Message to ${member?.username || 'member'} would be sent`)}
                      >
                        <FiMail />
                      </Button>
                      
                      {member?.role !== 'leader' && (
                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember({...member, action: 'remove'});
                            setActionModalOpen(true);
                          }}
                        >
                          <FiUserX />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No pending members found for this group
            </div>
          )}
        </div>
      </div>

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={inviteMembers}
        groupId={groupId}
        currentMembers={members.map(m => m?.userId).filter(Boolean)}
      />

      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMember?.action === 'remove' ? 'Remove Member' : 'Change Role'}
            </DialogTitle>
          </DialogHeader>

          {selectedMember?.action === 'remove' ? (
            <div className="space-y-4">
              <p>Are you sure you want to remove <strong>{selectedMember?.username || 'this member'}</strong> from the group?</p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button variant="danger" onClick={removeMember}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Change role for <strong>{selectedMember?.username || 'this member'}</strong>:</p>
              <div className="grid grid-cols-3 gap-2">
                {['member', 'co-leader', 'leader'].map(role => (
                  <Button
                    key={role}
                    variant={selectedMember?.role === role ? 'primary' : 'outline'}
                    onClick={() => {
                      if (selectedMember?.userId) {
                        updateMemberRole(selectedMember.userId, role);
                        setActionModalOpen(false);
                      }
                    }}
                    disabled={selectedMember?.role === role}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}