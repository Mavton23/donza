import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiTrash2, FiUsers, FiCalendar, FiLock, FiLink } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '@/services/api';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import MemberRoleBadge from '@/utils/MemberRoleBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ScheduleEditor from '@/utils/ScheduleEditor';

export default function StudyGroupEditPage() {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [schedule, setSchedule] = useState([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Buscar dados do grupo
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupRes = await api.get(`/groups/${communityId}/study-groups/${groupId}`);
        
        setGroup(groupRes.data.data);
        setSchedule(groupRes.data.data.meetingSchedule || []);
        reset({
          ...groupRes.data.data,
          maxMembers: groupRes.data.data.maxMembers || ''
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Falha ao carregar dados do grupo');
        navigate(`/communities/${communityId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [communityId, groupId, reset, navigate]);

  // Atualizar grupo
  const onSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        meetingSchedule: schedule,
        maxMembers: data.maxMembers ? Number(data.maxMembers) : null
      };

      const response = await api.patch(
        `/groups/${groupId}`, 
        updatedData
      );
      
      // Mostra a notificação de sucesso
      toast.success('Grupo atualizado com sucesso!', {
        duration: 3000,
        onAutoClose: () => {
          navigate(`/communities/${communityId}/groups/${groupId}`);
        }
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar grupo');
    }
  };

  // Excluir grupo
  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/groups/${communityId}/study-groups/${groupId}`);
        toast.success('Grupo excluído com sucesso');
        navigate(`/communities/${communityId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Falha ao excluir grupo');
      }
    }
  };

  // Atualizar membro
  const updateMemberRole = async (userId, newRole) => {
    try {
      await api.patch(`/groups/study-groups/${groupId}/members/${userId}`, { role: newRole });
      
      // Atualiza o membro diretamente no estado do grupo
      setGroup(prev => ({
        ...prev,
        members: prev.members.map(m => 
          m.userId === userId ? { ...m, role: newRole } : m
        )
      }));
      
      toast.success('Função do membro atualizada');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar função');
    }
  };

  // Remover membro
  const removeMember = async (userId) => {
    try {
      await api.delete(`/groups/study-groups/${groupId}/members/${userId}`);
      
      // Remove o membro diretamente do estado do grupo
      setGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m.userId !== userId),
        membersCount: prev.membersCount - 1
      }));
      
      toast.success('Membro removido');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao remover membro');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!group) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Editar Grupo de Estudo</h1>
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              <FiSave className="mr-2" /> Salvar Alterações
            </Button>
            <Button 
              type="button" 
              variant="danger-outline" 
              onClick={handleDelete}
            >
              <FiTrash2 className="mr-2" /> Excluir Grupo
            </Button>
          </div>
        </div>

        {/* Seção Básica */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Grupo"
              {...register('name', { required: 'Nome do grupo é obrigatório' })}
              error={errors.name}
            />
            
            <Input
              label="Máximo de Membros"
              type="number"
              {...register('maxMembers', { 
                min: { value: 2, message: 'Mínimo de 2 membros' },
                max: { value: 50, message: 'Máximo de 50 membros' }
              })}
              error={errors.maxMembers}
            />
          </div>

          <Textarea
            label="Descrição"
            className="mt-4"
            rows={4}
            {...register('description')}
          />
        </div>

        {/* Agenda */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Agenda de Reuniões
          </h2>
          <ScheduleEditor 
            schedule={schedule} 
            onChange={setSchedule} 
          />
        </div>

        {/* Membros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiUsers className="mr-2" /> Membros ({group.membersCount}/{group.maxMembers || '∞'})
          </h2>
          
          <div className="space-y-3">
            {group.members.map(member => (
              <div key={member.userId} className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                <div className="flex items-center">
                  <Avatar 
                    src={member.avatarUrl} 
                    alt={member.username} 
                    size="sm" 
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{member.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Membro desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MemberRoleBadge 
                    role={member.role} 
                    onChange={(newRole) => updateMemberRole(member.userId, newRole)}
                    editable={member.role !== 'leader'}
                  />
                  
                  {member.role !== 'leader' && (
                    <Button
                      type="button"
                      variant="danger-outline"
                      size="sm"
                      onClick={() => removeMember(member.userId)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiLock className="mr-2" /> Configurações Avançadas
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                {...register('isPrivate')}
                className="mr-2"
              />
              <label htmlFor="isPrivate">Grupo Privado (Requer aprovação para entrar)</label>
            </div>
            
            {group.inviteCode && (
              <Input
                label="Link de Convite"
                readOnly
                value={`${window.location.origin}/join-group/${group.inviteCode}`}
                icon={<FiLink className="text-gray-400" />}
                onFocus={(e) => e.target.select()}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}