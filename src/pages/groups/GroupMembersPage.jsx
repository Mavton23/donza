import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiUserX, FiMail, FiChevronDown } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
          api.get(`/groups/group/${groupId}/pending-members`)
        ]);
        
        // Adicionando tratamento defensivo para os dados
        const normalizedMembers = normalizeApiData(membersRes?.data);
        const normalizedRequests = normalizeApiData(requestsRes?.data.data);
        
        setMembers(normalizedMembers);
        setFilteredMembers(normalizedMembers);
        setPendingRequests(normalizedRequests);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Falha ao carregar membros');
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
      toast.success('Cargo do membro atualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar cargo');
    }
  };

  const removeMember = async () => {
    if (!selectedMember?.userId) return;
    
    try {
      await api.delete(`/groups/${groupId}/members/${selectedMember.userId}`);
      setMembers(members.filter(m => m?.userId !== selectedMember.userId));
      setActionModalOpen(false);
      toast.success('Membro removido do grupo');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao remover membro');
    }
  };

  const inviteMembers = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      toast.warning('Nenhum usuário selecionado');
      return;
    }
  
  try {
    await api.post(`/groups/groups/${groupId}/invite`, { userIds });
    setInviteModalOpen(false);
    toast.success(`Convites enviados para ${userIds.length} usuário(s)`);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Falha ao enviar convites';
    toast.error(errorMessage);
    console.error('Erro no convite:', err.response?.data || err.message);
  }
};

  const handleJoinRequest = async (requestId, action, userId) => {
    if (!requestId) return;

    try {
      const endpoint = action === 'approve' 
          ? `/groups/group/${groupId}/members/${requestId}/approve`
          : `/groups/group/${groupId}/members/${requestId}/reject`;
      
      await api.patch(endpoint, { userId });
      setPendingRequests(pendingRequests.filter(r => r?.requestId !== requestId));
      toast.success(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao processar solicitação');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gestão de Membros do Grupo</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="primary" 
            onClick={() => setInviteModalOpen(true)}
          >
            <FiUserPlus className="mr-2" /> Convidar Membros
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Pesquisar membros por nome ou cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<FiSearch />}
        />
      </div>

      {pendingRequests?.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Solicitações de Entrada Pendentes ({pendingRequests.length})</h2>
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request?.requestId || Math.random()} className="p-3 border-b dark:border-yellow-800">
                <div className="flex gap-3">
                  <Avatar src={request?.avatarUrl} alt={request?.username} size="sm" className="mr-3" />
                  <div>
                    <p className="font-medium">{request?.username || 'Utilizador desconhecido'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mensagem: {request?.message || 'Sem nenhuma mensagem'}
                    </p>
                    <p className="text-sm pt-1 text-gray-500 dark:text-gray-400">
                      Solicitou em {request?.requestedAt ? new Date(request.requestedAt).toLocaleDateString('pt-PT') : 'data desconhecida'}
                    </p>
                  </div>
                </div>
                <div className=" flex gap-2 mt-3">
                  <Button
                    variant="success-outline"
                    size="sm"
                    onClick={() => handleJoinRequest(request?.requestId, 'approve', request?.userId)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="danger-outline"
                    size="sm"
                    onClick={() => handleJoinRequest(request?.requestId, 'reject', request?.userId)}
                  >
                    Rejeitar
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
                      <p className="font-medium">{member?.username || 'Membro desconhecido'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entrou em {member?.joinedAt ? new Date(member.joinedAt).toLocaleDateString('pt-PT') : 'data desconhecida'}
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
                        {member?.role === 'leader' ? 'líder' : member?.role === 'co-leader' ? 'co-líder' : 'membro'}
                        {member?.role !== 'leader' && <FiChevronDown className="ml-1" />}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.info(`Mensagem para ${member?.username || 'membro'} seria enviada`)}
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
              Nenhum membro encontrado neste grupo
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
              {selectedMember?.action === 'remove' ? 'Remover Membro' : 'Alterar Cargo'}
            </DialogTitle>
          </DialogHeader>

          {selectedMember?.action === 'remove' ? (
            <div className="space-y-4">
              <p>Tem a certeza que deseja remover <strong>{selectedMember?.username || 'este membro'}</strong> do grupo?</p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button variant="danger" onClick={removeMember}>
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Alterar cargo para <strong>{selectedMember?.username || 'este membro'}</strong>:</p>
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
                    {role === 'leader' ? 'líder' : role === 'co-leader' ? 'co-líder' : 'membro'}
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