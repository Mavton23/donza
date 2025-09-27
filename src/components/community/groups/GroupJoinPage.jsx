import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { 
    Lock, 
    Users, 
    Calendar, 
    BookOpen, 
    DoorOpen,
    Check, 
    X, 
    Loader2, 
    Mail,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getErrorMessage } from '@/hooks/getErrorMessage';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TimeAgo from '@/components/common/TimeAgo';

export default function GroupJoinPage() {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/groups/${communityId}/groups/${groupId}`);
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Falha ao buscar dados do grupo');
        }
        
        const groupData = response.data.data;
        setGroup(groupData);
        
        const isGroupMember = groupData.members?.some(member => member.userId === user.userId);
        setIsCurrentUserMember(isGroupMember);

        if (isGroupMember) {
          toast.info('Você já é membro deste grupo');
          navigate(`/communities/${communityId}/groups/${groupId}`);
          return;
        }

        // Verificar se o usuário já tem uma solicitação pendente para grupos privados
        if (groupData.privacy === 'private' || groupData.privacy === 'invite_only') {
          try {
            const requestResponse = await api.get(`/groups/group/${groupId}/join-request/status`);
            if (requestResponse.data?.success && requestResponse.data.data?.status === 'pending') {
              setRequestSent(true);
            }
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (groupId && communityId && user) {
      fetchGroup();
    }
  }, [groupId, communityId, user]);

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      
      // Grupos que requerem aprovação (privados ou por convite)
      if (group.privacy === 'private' || group.privacy === 'invite_only') {
        const response = await api.post(`/groups/group/${groupId}/join-request`, {
          message: message || undefined
        });
        
        if (response.data?.success) {
          setRequestSent(true);
          toast.success("Solicitação enviada para os administradores do grupo.");
        }
      } else {
        // Entrar diretamente em grupo público
        const response = await api.post(`/groups/group/${groupId}/join`);
        
        if (response.data?.success) {
          // toast.success("Você agora é membro deste grupo!");
          navigate(`/communities/${communityId}/groups/${groupId}`);
        }
      }
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Grupo não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            O grupo que você está tentando acessar não existe ou foi removido.
          </p>
          <Button onClick={() => navigate(`/communities/${communityId}/groups`)}>
            Voltar para Grupos
          </Button>
        </div>
      </div>
    );
  }

  const isPrivate = group.privacy === 'private';
  const requireInvite = group.privacy === 'invite_only';
  const isFull = group.maxMembers && group.membersCount >= group.maxMembers; // Corrigido: membersCount
  const nextMeeting = group.upcomingMeetings?.[0];
  const progressPercentage = group.maxMembers ? (group.membersCount / group.maxMembers) * 100 : 0;

  const formatScheduleText = () => {
    if (!group.meetingSchedule) return 'Horário não definido';
    
    const { frequency, weekdays = [], time, duration } = group.meetingSchedule;
    
    if (frequency === 'weekly' && weekdays.length > 0) {
      const dayMap = {
        monday: 'Segunda',
        tuesday: 'Terça', 
        wednesday: 'Quarta',
        thursday: 'Quinta',
        friday: 'Sexta',
        saturday: 'Sábado',
        sunday: 'Domingo'
      };
      
      const days = weekdays.map(day => dayMap[day.toLowerCase()] || day);
      return `Toda(s) ${days.join(', ')} às ${time} (${duration}min)`;
    }
    
    return `Reuniões ${frequency} às ${time}`;
  };

  const renderJoinContent = () => {
    if (isCurrentUserMember) {
      return (
        <div className="text-center py-6">
          <DoorOpen className="h-12 w-12 mx-auto text-green-500 dark:text-green-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Você já é membro
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Você já faz parte deste grupo de estudo.
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => navigate(`/communities/${communityId}/groups/${groupId}`)}
            >
              Acessar Grupo
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/communities/${communityId}`)}
            >
              Voltar a comunidade
            </Button>
          </div>
        </div>
      );
    }

    if (isFull) {
      return (
        <div className="text-center py-6">
          <X className="h-12 w-12 mx-auto text-red-500 dark:text-red-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Grupo Lotado
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Este grupo atingiu o número máximo de {group.maxMembers} membros.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(`/communities/${communityId}/groups`)}
          >
            Voltar para Grupos
          </Button>
        </div>
      );
    }

    if (requestSent) {
      return (
        <div className="text-center py-6">
          <Mail className="h-12 w-12 mx-auto text-indigo-500 dark:text-indigo-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Solicitação Enviada
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Sua solicitação para participar deste grupo foi enviada aos administradores. 
            Você será notificado quando for aprovado.
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate(`/communities/${communityId}`)}
            >
              Explorar Outros Grupos
            </Button>
            <Button 
              onClick={() => navigate(`/communities/${communityId}`)}
            >
              Voltar para Comunidade
            </Button>
          </div>
        </div>
      );
    }

    if (isPrivate || requireInvite) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            {isPrivate ? (
              <Lock className="h-10 w-10 mx-auto text-purple-500 dark:text-purple-400 mb-2" />
            ) : (
              <Mail className="h-10 w-10 mx-auto text-amber-500 dark:text-amber-400 mb-2" />
            )}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isPrivate ? 'Este grupo é privado' : 'Este grupo requer convite'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isPrivate 
                ? 'Você precisa de aprovação dos administradores para participar.'
                : 'Você precisa ser convidado ou solicitar acesso aos administradores.'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="join-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mensagem para os administradores (opcional)
              </label>
              <textarea
                id="join-message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Explique por que você gostaria de participar deste grupo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/communities/${communityId}`)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleJoinGroup}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {isPrivate ? 'Enviar Solicitação' : 'Solicitar Acesso'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Grupo público
    return (
      <div className="text-center py-6">
        <Users className="h-12 w-12 mx-auto text-indigo-500 dark:text-indigo-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Junte-se a este grupo
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Este grupo é aberto a todos os membros da comunidade.
        </p>
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/communities/${communityId}`)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleJoinGroup}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Participar do Grupo
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Link to={`/communities/${communityId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Comunidade
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/communities/${communityId}/groups`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Grupos de Estudo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            Participar do Grupo
          </span>
        </nav>

        {/* Main Card */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className={cn(
            "border-b border-gray-200 dark:border-gray-700",
            isPrivate ? "bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20" :
            requireInvite ? "bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20" :
            "bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/50 dark:to-blue-900/20"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {group.name}
                  {isPrivate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <Lock className="h-3 w-3 mr-1" />
                      Privado
                    </span>
                  )}
                  {requireInvite && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <Mail className="h-3 w-3 mr-1" />
                      Por Convite
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                  <div dangerouslySetInnerHTML={{ __html: group.description || 'Nenhuma descrição fornecida' }} />
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Group Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Members */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-medium">Membros</span>
                </div>
                {group.maxMembers ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{group.membersCount}/{group.maxMembers}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 bg-gray-200 dark:bg-gray-700"
                      indicatorClassName={cn(
                        progressPercentage >= 90 ? 'bg-red-400 dark:bg-red-500' :
                        progressPercentage >= 75 ? 'bg-amber-400 dark:bg-amber-500' :
                        'bg-indigo-400 dark:bg-indigo-500'
                      )}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{group.membersCount} membros</p>
                )}
              </div>

              {/* Meeting Schedule */}
              {group.meetingSchedule && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-medium">Agendamento</span>
                  </div>
                  <p className="text-sm">{formatScheduleText()}</p>
                </div>
              )}

              {/* Created At */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium">Criado</span>
                </div>
                <p className="text-sm">
                  <TimeAgo date={group.createdAt} />
                </p>
              </div>

              {/* Creator */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <span className="font-medium">Criador</span>
                </div>
                <p className="text-sm">@{group.creator?.username}</p>
              </div>
            </div>

            {/* Join Section - APENAS UMA VEZ */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {renderJoinContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}