import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Spinner } from 'react-bootstrap';
import { 
  FiArrowLeft, FiUsers, FiCalendar, FiClock, FiMapPin, 
  FiBook, FiPlus, FiEdit2, FiTrash2, FiMoreVertical, 
  FiLock, FiAward, FiBarChart2, FiCheckCircle,
  FiFile,
  FiMessageCircle,
  
} from 'react-icons/fi';
import { Info } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Avatar from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import TimeAgo from '@/components/common/TimeAgo';
import Dropdown from '@/components/common/Dropdown';
import { Button } from '@/components/ui/button';
import TabNavigation from '@/components/profile/TabNavigation';
import ScheduleMeetingModal from '@/components/community/ScheduleMeetingModal';
import TaskList from '@/components/community/groups/TaskList';
import ContentUploader from '@/components/community/groups/ContentUploader';
import ContentGallery from '@/components/community/groups/sharedcontent/ContentGallery';
import ContentPreviewModal from '@/components/community/groups/sharedcontent/ContentPreviewModal';
import EditContentModal from '@/components/community/groups/sharedcontent/EditContentModal';
import LeaderBoard from '../../components/community/groups/gamification/LeaderBoard';
import UserStatsCard from '@/components/community/groups/gamification/UserStatCard';
import DebateChat from '@/components/community/groups/chat/DebateChat';
import ReportFilters from '@/components/community/groups/report/ReportFilters';
import ReportCard from '@/components/community/groups/report/ReportCard';
import ActivityChart from '@/components/community/groups/report/ActivityChart';
import TaskCompletionChart from '@/components/community/groups/report/TaskCompletionChart';
import CalendarView from '@/components/community/groups/calendar/CalendarView';
import CalendarSyncButton from '@/components/community/groups/calendar/CalendarSyncButton';
import { useRequireGroupMembership } from '@/hooks/useRequireGroupMembership';
import { useGroupContent } from '@/hooks/useGroupContent';
import { toast } from 'sonner';

const StudyGroupDetail = () => {
  const { communityId, groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [previewContent, setPreviewContent] = useState(false)
  const [editContent, setEditContent] = useState(false)
  const [reportPeriod, setReportPeriod] = useState('7d'); // 7d, 30d, 90d
  const [stats, setStats] = useState({
    activeMembersReports: 0,
    completedTasks: 0,
    newContent: 0,
    engagementRate: 0
  });
  const [activityData, setActivityData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const { 
  contents, 
  isLoading, 
  errorOccured,
  uploadFile, 
  addLink, 
  updateContent, 
  deleteContent, 
  registerDownload 
} = useGroupContent(groupId, group?.contents || []);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [groupRes, groupMeets, membershipRes] = await Promise.all([
          api.get(`/groups/${communityId}/groups/${groupId}`),
          api.get(`/groups/${groupId}/meetings`),
          currentUser?.userId && api.get(`/groups/groups/${groupId}/membership`)
        ]);
  
        setGroup({
          ...groupRes.data.data,
          meetingSchedule: groupRes.data.data.meetingSchedule || {},
          members: groupRes.data.data.members || [],
          meetings: groupMeets.data || []
        });

        setStats({ ...groupRes.data.data.stats })
        
        if (membershipRes && membershipRes.data.data) {
          setIsMember(true);
          setUserRole(membershipRes.data.data.role || null);
        } else {
          setIsMember(false);
          setUserRole(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load group data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchGroupData();
  }, [communityId, groupId, currentUser?.userId]);

const { shouldRedirect } = useRequireGroupMembership({
    isMember,
    loading,
    redirectTo: `/communities/${communityId}/groups/${groupId}/join`
  });

  if (shouldRedirect) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
          Você não é membro deste grupo.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecionando para a página de participação...
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // Função para exportar relatório
  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      await exportReportData(reportPeriod);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleJoin = async () => {
    try {
      const response = await api.post(`/groups/groups/${groupId}/join`);
      setIsMember(true);
      setUserRole(response.data.role);
      setGroup(prev => ({
        ...prev,
        membersCount: prev.membersCount + 1,
        members: [...prev.members, {
          userId: currentUser.userId,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          role: response.data.role,
          joinedAt: new Date().toISOString()
        }]
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Tem certeza que deseja sair deste grupo de estudos?')) return;
    
    try {
      await api.delete(`/groups/groups/${groupId}/leave`);
      setIsMember(false);
      setUserRole(null);
      setGroup(prev => ({
        ...prev,
        membersCount: prev.membersCount - 1,
        members: prev.members.filter(m => m.userId !== currentUser.userId)
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao sair do grupo');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo?')) return;
    
    try {
      await api.delete(`/groups/${communityId}/groups/${groupId}`);
      navigate(`/communities/${communityId}`, { 
        state: { message: 'Grupo de estudos excluído com sucesso' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao excluir grupo');
    }
  };

  const handleScheduleMeeting = async (meetingData) => {
    try {
      const response = await api.post(`/groups/${groupId}/meetings`, meetingData);
      setGroup(prev => ({
        ...prev,
        meetings: [...prev.meetings, response.data],
        meetingCount: prev.meetingCount + 1
      }));
      setShowScheduleModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleTabChange = (tab) => {
    if (!group.isPublic && !isMember && tab !== 'overview') {
      setError('Join the group to access this content');
      return;
    }
    setActiveTab(tab);
    setError(null);
  };

  const handleUpload = async (files) => {
  const result = await uploadFile(files[0]);
  if (result.success) {
    toast.success('Arquivo enviado com sucesso!');
  } else {
    toast.error(result.error);
  }
};

const handleLinkSubmit = async (url) => {
  const result = await addLink(url);
  if (result.success) {
    toast.success('Link compartilhado com sucesso!');
  } else {
    toast.error(result.error);
  }
};

const handleEditSubmit = async (updatedContent) => {
  const result = await updateContent(updatedContent.contentId, {
    title: updatedContent.title,
    description: updatedContent.description
  });
  
  if (result.success) {
    toast.success('Conteúdo atualizado com sucesso!');
    setEditContent(null);
  } else {
    toast.error(result.error);
  }
};

const handleDeleteContent = async (contentId) => {
  const result = await deleteContent(contentId);
  if (result.success) {
    toast.success('Conteúdo removido com sucesso!');
  } else {
    toast.error(result.error);
  }
};

const handleDownload = async (contentId) => {
  // Encontra o conteúdo para pegar a URL
  const content = contents.find(c => c.contentId === contentId);
  if (!content) return;
  
  // Registra o download
  await registerDownload(contentId);
  
  // Abre o conteúdo em nova aba
  const url = content.fileUrl || content.externalUrl;
  window.open(url, '_blank');
};

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorAlert message={error} onRetry={() => window.location.reload()} />;
  if (!group) return <ErrorAlert message="Study group not found" />;

  // Permissões baseadas no modelo do backend
  const isLeader = userRole === 'leader';
  const isCoLeader = userRole === 'co-leader';
  const canEdit = isLeader || isCoLeader;
  const canDelete = isLeader;
  const canSchedule = isLeader || isCoLeader;
  const canManageMembers = isLeader || isCoLeader;

  const dropdownActions = [
    canEdit && {
      label: 'Editar Grupo',
      icon: <FiEdit2 className="mr-2" />,
      action: () => navigate(`edit`)
    },
    canDelete && {
      label: 'Excluir Grupo',
      icon: <FiTrash2 className="mr-2" />,
      action: handleDelete,
      danger: true
    }
  ].filter(Boolean);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to={`/communities/${communityId}`}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <FiArrowLeft className="mr-2" />
            Voltar para comunidade
          </Link>

        <div className="flex justify-between items-start gap-4 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {group.name}
              {group.maxMembers && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({group.membersCount}/{group.maxMembers} members)
                </span>
              )}
            </h1>
            <div className="text-gray-600 dark:text-gray-300 mt-1">
              <div dangerouslySetInnerHTML={{ __html: group.description }} />
            </div>
          </div>

          {dropdownActions.length > 0 && (
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FiMoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              }
              items={dropdownActions}
              align="right"
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar 
            src={group.creator?.avatarUrl} 
            alt={group.creator?.username}
            size="md"
          />
          <div>
            <Link 
              to={`/profile/${group.creator?.username}`}
              className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {group.creator?.username}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created <TimeAgo date={group.createdAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNavigation
          tabs={[
            { id: 'overview', label: 'Visão Geral', icon: FiBook },
            { id: 'members', label: 'Membros', icon: FiUsers },
            { id: 'tasks', label: 'Tarefas', icon: FiCheckCircle },
            { id: 'chat', label: 'Chat', icon: FiMessageCircle },
            { id: 'content', label: 'Recursos', icon: FiFile },
            { id: 'meetings', label: 'Reuniões', icon: FiCalendar },
            { id: 'gamification', label: 'Classificação', icon: FiAward },
            { id: 'calendar', label: 'Calendário', icon: FiCalendar },
            { id: 'reports', label: 'Relatórios', icon: FiBarChart2 },
          ]}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

      {/* Content */}
      <div className="mt-6">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          )}

          {!isMember && activeTab !== 'overview' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-6">
              <div className="flex items-center">
                <FiLock className="flex-shrink-0 text-yellow-400 dark:text-yellow-300 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {group.maxMembers && group.membersCount >= group.maxMembers 
                      ? 'Grupo está cheio' 
                      : 'Entre no grupo para acessar todos os recursos'}
                  </h3>
                  <div className="mt-2">
                    {group.maxMembers && group.membersCount >= group.maxMembers ? (
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Este grupo atingiu sua capacidade máxima.
                      </p>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleJoin}
                      >
                        Entrar no Grupo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Sobre este grupo
                  </h2>
                  <div className="prose dark:prose-invert max-w-none flex items-start gap-2">
                    <Info className="text-blue-500 mt-1 w-5 h-5" />
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: group.description }} />
                  </div>
                </div>

                  {group.meetingSchedule?.frequency && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Agenda de Reuniões Regulares
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FiCalendar className="text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {group.meetingSchedule.frequency} às {group.meetingSchedule.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FiUsers className="text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Detalhes do Grupo
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                      <div className="mt-1 flex items-center gap-2">
                        {isMember ? (
                          <Badge color="green">Membro</Badge>
                        ) : (
                          <Badge color="gray">Não é membro</Badge>
                        )}
                        {userRole && (
                          <Badge color={userRole === 'leader' ? 'purple' : 'blue'}>
                            {userRole === 'leader' ? 'Líder' : 'Co-líder'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Membros</h3>
                      <p className="mt-1">
                        {group.membersCount} membro{group.membersCount !== 1 ? 's' : ''}
                        {group.maxMembers && ` de ${group.maxMembers} máximo`}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isMember ? (
                        <div className="space-y-3">
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => navigate('meetings')}
                          >
                            Ver Reuniões
                          </Button>
                          <Button 
                            variant="danger" 
                            className="w-full"
                            onClick={handleLeave}
                          >
                            Sair do Grupo
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={handleJoin}
                          disabled={group.maxMembers && group.membersCount >= group.maxMembers}
                        >
                          {group.maxMembers && group.membersCount >= group.maxMembers 
                            ? 'Grupo está cheio' 
                            : 'Entrar no Grupo'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskList 
              role={userRole}
              groupId={groupId}
              canEdit={isLeader || isCoLeader}
              members={group.members || []}
            />
          )}

          {activeTab === 'chat' && (
            <DebateChat groupId={groupId} />
          )}

          {activeTab === 'meetings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Próximas Reuniões
                </h2>
                {canSchedule && (
                  <Button 
                    variant="secondary" 
                    icon={<FiPlus size={16} />}
                    onClick={() => setShowScheduleModal(true)}
                  >
                    Agendar Reunião
                  </Button>
                )}
              </div>

              {group.meetings?.length > 0 ? (
                <div className="space-y-4">
                  {group.meetings.map(meeting => (
                    <div key={meeting.meetingId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium">
                          {new Date(meeting.startTime).toLocaleDateString('pt-BR')}
                        </span>
                        <FiClock className="ml-3 text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {new Date(meeting.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(meeting.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="mt-2 font-medium">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {meeting.description}
                        </p>
                      )}
                      {meeting.location && (
                        <div className="mt-3">
                          <a 
                            href={meeting.location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <FiMapPin className="mr-1.5" />
                            {meeting.location.includes('http') ? 'Participar da Reunião' : meeting.location}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {canSchedule ? (
                    <Button 
                      variant="ghost" 
                      icon={<FiPlus />}
                      onClick={() => setShowScheduleModal(true)}
                    >
                      Agendar a primeira reunião
                    </Button>
                  ) : (
                    "Nenhuma reunião agendada"
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              {errorOccured && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}
              
              <ContentUploader
                onUpload={handleUpload}
                onLinkSubmit={handleLinkSubmit}
                isUploading={isLoading}
              />
              
              {isLoading && !contents.length ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <ContentGallery
                  contents={contents}
                  onPreview={setPreviewContent}
                  onEdit={setEditContent}
                  onDelete={handleDelete}
                  canEdit={isLeader || isCoLeader}
                />
              )}

              {previewContent && (
                <ContentPreviewModal
                  content={previewContent}
                  isOpen={!!previewContent}
                  onClose={() => setPreviewContent(null)}
                  onDownload={handleDownload}
                />
              )}

              {editContent && (
                <EditContentModal
                  content={editContent}
                  isOpen={!!editContent}
                  onClose={() => setEditContent(null)}
                  onSubmit={handleEditSubmit}
                  isSubmitting={isLoading}
                />
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Membros do Grupo ({group.membersCount})
                  </h2>
                  {canManageMembers && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => navigate('manage-members')}
                    >
                      Gerenciar Membros
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {group.members?.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.avatarUrl} alt={member.username} size="md" />
                        <div>
                          <Link 
                            to={`/profile/${member.username}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {member.username}
                            {member.userId === currentUser?.userId && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Você)</span>
                            )}
                          </Link>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Membro desde <TimeAgo date={member.joinedAt} /> • {member.contributionScore || 0} pts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === 'leader' && (
                          <FiAward className="text-yellow-500 dark:text-yellow-400" />
                        )}
                        <Badge color={
                          member.role === 'leader' ? 'purple' : 
                          member.role === 'co-leader' ? 'blue' : 'gray'
                        }>
                          {member.role === 'leader' ? 'Líder' : member.role === 'co-leader' ? 'Co-líder' : 'Membro'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gamification' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-4">Classificação do Grupo</h2>
                  <LeaderBoard members={group.members || []} />
                </div>
              </div>
              <div>
                <UserStatsCard 
                  userStats={group.gamificationUser || {
                    username: currentUser.username,
                    avatarUrl: currentUser.avatarUrl,
                    level: group.gamificationUser.level || 1,
                    points: group.gamificationUser.points || 0,
                    currentLevelProgress: group.gamificationUser.currentLevelProgress || 0,
                    nextLevelThreshold: group.gamificationUser.nextLevelThreshold || 2,
                    completedTasks: group.gamificationUser.completedTasks || 0,
                    contributedContent: group.gamificationUser.contributedContent || 0,
                    helpfulReplies: group.gamificationUser.helpfulReplies || 0,
                    recentAchievements: group.gamificationUser.recentAchievements || []
                  }} 
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Calendário do Grupo</h2>
                <CalendarSyncButton
                  onSyncGoogle={() => console.log('Sincronizando com Google Calendar...')}
                  onSyncOutlook={() => console.log('Sincronizando com Outlook...')}
                  isSynced={false}
                />
              </div>
          
              <CalendarView
                events={group.events || []}
                groupMembers={group.members || []}
                onCreateEvent={(newEvent) => {
                  console.log('Criando evento:', newEvent);
                }}
                onUpdateEvent={(updatedEvent) => {
                  console.log('Atualizando evento:', updatedEvent);
                }}
                onDeleteEvent={(eventId) => {
                  console.log('Excluindo evento:', eventId);
                }}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Filtros e Cards de Relatório */}
              <ReportFilters 
                period={reportPeriod}
                setPeriod={setReportPeriod}
                onExport={handleExportReport}
                isLoading={isExporting}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportCard 
                  title="Membros Ativos" 
                  value={stats.activeMembersReports} 
                  change={0} 
                  description="Quantidade total de membros ativos nos últimos 30 dias"
                />
                <ReportCard 
                  title="Tarefas Concluídas" 
                  value={stats.completedTasks} 
                  change={0} 
                  unit="tarefas"
                  description="Total de tarefas concluídas pelos membros no período analisado"
                />
                <ReportCard 
                  title="Novos Conteúdos" 
                  value={stats.newContent} 
                  change={0} 
                  description="Número de conteúdos adicionados recentemente ao grupo"
                />
                <ReportCard 
                  title="Taxa de Engajamento" 
                  value={stats.engagementRate} 
                  change={0} 
                  unit="%" 
                  description="Proporção de membros que interagiram com o conteúdo ou reuniões"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ActivityChart 
                  data={activityData}
                  period={reportPeriod}
                />
                <TaskCompletionChart 
                  tasks={group.tasks || []}
                />
              </div>

              {/* Estatísticas do Grupo */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 backdrop-blur-sm transition-colors duration-300">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-300">
                  Estatísticas do Grupo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/30 transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Total de Reuniões
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-indigo-100 transition-colors duration-300">
                      {group.meetingCount || 0}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/30 transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Atividade dos Membros
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-emerald-100 transition-colors duration-300">
                      {group.activeMembers || 0}<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/{group.membersCount}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/30 transition-all duration-300 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/30 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-300">
                      Média de Participação
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-amber-100 transition-colors duration-300">
                      {group.avgAttendance?.toFixed(1) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>

      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleMeeting}
          defaultSchedule={group.meetingSchedule}
        />
      )}
    </div>
  );
};

export default StudyGroupDetail;