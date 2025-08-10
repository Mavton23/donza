import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { 
    Lock, 
    Users, 
    Calendar, 
    BookOpen, 
    Check, 
    X, 
    Loader2, 
    Mail,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function GroupJoinPage() {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/groups/${communityId}/groups/${groupId}`);
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to fetch group details');
        }
        
        setGroup(response.data.data);
        
        // Verificar se o usuário já tem uma solicitação pendente
        // NOTE: Você precisará implementar essa API ou ajustar conforme sua lógica
        // if (response.data.data.isPrivate) { // Ajuste conforme sua propriedade real
        //   const requestResponse = await api.get(`/groups/${groupId}/join-requests/status`);
        //   setRequestSent(requestResponse.data?.data?.status === 'pending');
        // }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError(err.response?.data?.message || 
                err.message || 
                'Failed to load group details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroup();
    }
  }, [groupId, communityId]);

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      
      if (group.privacy === 'private') {
        // Enviar solicitação para grupo privado
        const response = await api.post(`/groups/group/${groupId}/join-request`, {
          message
        });
        
        if (response.data?.success) {
          setRequestSent(true);
          toast({
            title: "Solicitação enviada",
            description: "Sua solicitação para participar do grupo foi enviada aos administradores.",
            status: "success"
          });
        }
      } else {
        // Entrar diretamente em grupo público
        const response = await api.post(`/groups/group/${groupId}/join`);
        
        if (response.data?.success) {
          toast({
            title: "Bem-vindo ao grupo!",
            description: "Você agora é membro deste grupo de estudo.",
            status: "success"
          });
          navigate(`/communities/${communityId}/groups/${groupId}`);
        }
      }
    } catch (err) {
      console.error('Error joining group:', err);
      toast({
        title: "Erro",
        description: err.response?.data?.message || 
                   "Ocorreu um erro ao tentar entrar no grupo. Por favor, tente novamente.",
        status: "error"
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Error" message={error} icon={AlertTriangle} />;
  if (!group) return <EmptyState title="Grupo não encontrado" message="O grupo solicitado não existe ou você não tem acesso." icon={Users} />;

  const isPrivate = group.privacy === 'private';
  const isFull = group.maxMembers && group.memberCount >= group.maxMembers;
  const nextMeeting = group.upcomingMeetings?.[0];
  const progressPercentage = group.maxMembers ? (group.membersCount / group.maxMembers) * 100 : 0;

  const scheduleText = group.meetingSchedule ? 
    `Toda(s) ${group.meetingSchedule.weekdays.join(', ')} às ${group.meetingSchedule.time}` : 
    'Horário não definido';

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
            isPrivate ? "bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20" : "bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/50 dark:to-blue-900/20"
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
                        className="h-2"
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
                    <p className="text-sm">
                        {scheduleText}
                    </p>
                        {group.meetingSchedule.duration && (
                    <p className="text-sm">Duração: {group.meetingSchedule.duration} minutos</p>
                    )}
                </div>
                )}

              {/* Focus Area */}
              {group.focusArea && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <BookOpen className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    <span className="font-medium">Área de Foco</span>
                  </div>
                  <p className="text-sm">{group.focusArea}</p>
                </div>
              )}

              {/* Next Meeting */}
              {nextMeeting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-medium">Próxima Reunião</span>
                  </div>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(nextMeeting.startTime), { addSuffix: true })}
                  </p>
                  {nextMeeting.title && (
                    <p className="text-sm italic">"{nextMeeting.title}"</p>
                  )}
                </div>
              )}

              {/* Created At */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium">Criado</span>
                </div>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Join Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {isFull ? (
                <div className="text-center py-6">
                  <X className="h-12 w-12 mx-auto text-red-500 dark:text-red-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Grupo Lotado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Este grupo atingiu o número máximo de membros.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate(`/communities/${communityId}/groups`)}
                  >
                    Voltar para Grupos
                  </Button>
                </div>
              ) : requestSent ? (
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
                      onClick={() => navigate(`/communities/${communityId}/groups`)}
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
              ) : isPrivate ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Lock className="h-10 w-10 mx-auto text-purple-500 dark:text-purple-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Este grupo é privado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Você precisa de aprovação dos administradores para participar.
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
                            Enviar Solicitação
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
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
                      onClick={() => navigate(`/communities/${communityId}/groups`)}
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}