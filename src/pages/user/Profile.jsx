import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lock, Globe, User, Edit, Check, X, Mail, Phone, Link as LinkIcon,
  Calendar, Shield, BookOpen, GraduationCap, Building, UserPlus, Heart,
  MessageSquare, Settings, Bell, Bookmark, Award, Briefcase
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ProfileForm from '@/components/profile/ProfileForm';
import UserStats from '@/components/profile/UserStats';
import TabNavigation from '@/components/profile/TabNavigation';
import ActivitiesTab from '@/components/profile/ActivitiesTab';
import InterestsSelector from '@/components/profile/InterestsSelector';
import ExpertiseEditor from '@/components/profile/ExpertiseEditor';
import InstitutionProfile from '@/components/profile/InstitutionProfile';
import NotificationPreferences from '@/components/profile/NotificationPreferences';
import { useNotification } from '@/contexts/NotificationContext';
import MessagePreferences from '@/components/profile/MessagePreferences';
import PrivacySettings from '@/components/profile/PrivacySettings';
import SocialMediaLinks from '@/components/profile/SocialMediaLinks';
import ConnectionsTab from '@/components/profile/ConnectionsTab';
import api from '@/services/api';
import { roleSpecificFields } from '@/utils/userUtils';
import { formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import { Info } from 'lucide-react';

export default function Profile() {
  usePageTitle();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { show } = useNotification();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    user: null,
    stats: {
      followersCount: 0,
      followingCount: 0,
      averageProgress: 0,
      completedCourses: 0
    },
    isFollowing: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        let response;
        if (username && currentUser?.username !== username) {
          setIsOwnProfile(false);
          response = await api.get(`/users/profile/${username}`);
          
          if (response.data.user?.isPrivate) {
            setIsPrivateProfile(true);
            return;
          }
        } else {
          setIsOwnProfile(true);
          response = await api.get('/users/me');
        }
        
        setProfileData({
          user: response.data.user || response.data.data,
          stats: response.data.stats || response.data.data.stats,
          isFollowing: response.data.data?.isFollowing || false
        });
        
        setProfileCompletion(calculateProfileCompletion(response.data.user || response.data.data));
      } catch (err) {
        console.error('Erro ao carregar perfil:', err instanceof Error ? err.message : err);
        toast.error('Falha ao carregar perfil');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser?.userId, navigate]);

  const calculateProfileCompletion = (user) => {
    if (!user || !user.role) return 0;
    
    const requiredFields = roleSpecificFields[user.role]?.requiredFields || [];
    if (requiredFields.length === 0) return 100;
    
    const completedFields = requiredFields.filter(field => {
      const value = user[field];
      
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (typeof value === 'string') {
        return value.trim().length > 0;
      } else if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      
      return !!value;
    }).length;
  
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleUpdateProfile = async (updatedData) => {
    if (!isOwnProfile) return;
    
    setUpdatingProfile(true);
    setValidationErrors({});
    
    try {
      const payload = {
        ...updatedData,
        ...(profileData.user.role === 'student' && { 
          interests: updatedData.interests 
        }),
        ...(['instructor', 'institution'].includes(profileData.user.role) && { 
          expertise: updatedData.expertise,
          contactPhone: updatedData.contactPhone
        }),
        ...(profileData.user.role === 'institution' && {
          institutionName: updatedData.institutionName,
          institutionType: updatedData.institutionType,
          academicPrograms: updatedData.academicPrograms,
          website: updatedData.website
        }),
        ...(updatedData.notificationPreferences && {
          notificationPreferences: updatedData.notificationPreferences
        }),
        ...(updatedData.messagePreferences && {
          messagePreferences: updatedData.messagePreferences
        }),
        ...(updatedData.socialMedia && {
          socialMedia: updatedData.socialMedia
        })
      };

      const response = await api.put('/users/me', payload);
      
      setProfileData(prev => ({
        ...prev,
        user: {
        ...prev.user,
        ...response.data.data.user
      }
      }));
      
      await updateUser(response.data.data.user);
      
      setProfileCompletion(calculateProfileCompletion(response.data.data.user));
      setIsEditing(false);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      show('success', 'Perfil atualizado com sucesso');
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Falha ao atualizar perfil');
      }
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const newFollowingStatus = !profileData.isFollowing;
      const countChange = newFollowingStatus ? 1 : -1;
      
      setProfileData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount + countChange
        },
        isFollowing: newFollowingStatus
      }));

      if (newFollowingStatus) {
        await api.post(`/users/follow/${profileData.user.userId}`);
      } else {
        await api.delete(`/users/follow/${profileData.user.userId}`);
      }

      toast.success(newFollowingStatus ? 'Agora você está acompanhando' : 'Deixou de acompanhar');
    } catch (err) {
      setProfileData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount - (newFollowingStatus ? 1 : -1)
        },
        isFollowing: !newFollowingStatus
      }));
      toast.error('Erro ao atualizar status de seguimento');
    }
  };

  const handlePrivacyChange = async (isPrivate) => {
    try {
      const { data } = await api.patch('/users/me/privacy', { isPrivate });
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          isPrivate
        }
      }));
      updateUser(data.user);
      toast.success(`Perfil agora é ${isPrivate ? 'privado' : 'público'}`);
    } catch (err) {
      toast.error('Falha ao atualizar privacidade');
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!isOwnProfile) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfileData(prev => ({
        ...prev,
        user: data.user
      }));
      updateUser(data.user);
      toast.success('Foto de perfil atualizada');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar avatar');
    } finally {
      setLoading(false);
    }
  };

  const getTabsConfig = () => {
    const isPending = profileData.user?.status === 'pending';
    const role = profileData.user?.role;

    const getDisabledTabs = () => {
    if (!isPending) return [];
    
    const commonDisabledTabs = ['messages', 'management'];
    
    const roleSpecificDisabled = {
      instructor: [...commonDisabledTabs, 'expertise'],
      institution: [...commonDisabledTabs, 'programs', 'social'],
      student: [...commonDisabledTabs]
    };
    
    return roleSpecificDisabled[role] || commonDisabledTabs;
  };

    const baseTabs = [
      { id: 'profile', label: 'Perfil', icon: User, disabled: false },
      { id: 'stats', label: 'Estatísticas', icon: Award, disabled: isPending },
      { id: 'activities', label: 'Atividades', icon: Bookmark, disabled: false },
      { id: 'connections', label: 'Conexões', icon: UserPlus, disabled: isPending }
    ];
    
    if (!isOwnProfile) return baseTabs;
    
    const roleSpecificTabs = {
      student: [
        { id: 'interests', label: 'Interesses', icon: Heart },
        { id: 'messages', label: 'Mensagens', icon: MessageSquare },
        { id: 'social', label: 'Redes', icon: Globe }
      ],
      instructor: [
        { id: 'expertise', label: 'Expertise', icon: Briefcase, disabled: isPending },
        { id: 'messages', label: 'Mensagens', icon: MessageSquare, disabled: isPending },
        { id: 'social', label: 'Redes', icon: Globe, disabled: isPending }
      ],
      institution: [
        { id: 'programs', label: 'Programas', icon: BookOpen, disabled: isPending },
        { id: 'management', label: 'Gestão', icon: Settings, disabled: isPending },
        { id: 'social', label: 'Redes', icon: Globe, disabled: isPending }
      ]
    };

    const commonSettingsTabs = [
      { id: 'notifications', label: 'Notificações', icon: Bell, disabled: false },
      { id: 'privacy', label: 'Privacidade', icon: Lock, disabled: false }
    ];

    const allTabs = [
      ...baseTabs,
      ...(roleSpecificTabs[role] || []),
      ...commonSettingsTabs
    ];

    return allTabs.map(tab => ({
      ...tab,
      tooltip: tab.disabled ? 'Disponível após aprovação do perfil' : undefined
    }));

  };

  if (loading || !profileData.user) {
    return <LoadingSpinner fullScreen />;
  }

  if (isPrivateProfile && !isOwnProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            Perfil Privado
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Este perfil está configurado como privado. Você não pode visualizá-lo.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {['instructor', 'institution'].includes(profileData.user.role) && 
        profileData.user.status === 'pending' && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {profileData.user.role === 'instructor' 
                  ? 'Seus documentos e qualificações estão sendo verificados por nossa equipe. Enquanto isso, você pode explorar a plataforma, mas não poderá criar cursos ou receber mensagens.'
                  : 'Sua instituição está sendo avaliada quanto aos requisitos de credenciamento. Você receberá acesso completo após a aprovação.'}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Nossa equipe está revisando suas informações e documentos. 
                  Você receberá um e-mail quando o processo for concluído.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Bar */}
      {isOwnProfile && profileCompletion < 100 && (
        <div className="mb-6">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 mb-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center xs:text-left">
              Seu perfil está {profileCompletion}% completo
            </h3>
            <span className="text-xs text-gray-500 text-center xs:text-right">
              {roleSpecificFields[profileData.user.role]?.hint}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                profileCompletion < 50 ? 'bg-red-500' : 
                profileCompletion < 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-indigo-700 dark:bg-gray-900 px-6 py-8 relative">
          {isOwnProfile ? (
            <div className="absolute top-4 right-4 flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    title="Cancelar edição"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleUpdateProfile(profileData.user)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    title="Salvar alterações"
                    disabled={updatingProfile}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  title="Editar perfil"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-md flex items-center ${
                  profileData.isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${profileData.isFollowing ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                {profileData.isFollowing ? 'Acompanhando' : 'Acompanhar'}
              </button>
              <button
                onClick={() => navigate(`/messages/new?recipient=${profileData.user.userId}`)}
                className="px-4 py-2 rounded-md flex items-center bg-white text-indigo-700 hover:bg-gray-100"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagem
              </button>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="mr-6 mb-4 md:mb-0">
              <AvatarUpload
                currentUrl={profileData.user.avatarUrl || '/images/placeholder.png'}
                onUpload={handleAvatarUpload}
                size="xl"
                editable={isOwnProfile && isEditing}
              />
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-start mt-1 gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
                  {profileData.user.fullName || profileData.user.username}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {profileData.user.isVerified && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-custom-primary/30 dark:text-white flex items-center justify-center w-fit mx-auto sm:mx-0">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </span>
                  )}

                  {profileData?.user?.status === 'pending' && (
                    <span className="flex items-center justify-center text-yellow-100 bg-yellow-800/50 dark:bg-yellow-900/80 px-2 py-1 rounded-full text-xs w-fit mx-auto sm:mx-0">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Em análise
                  </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start mt-1 gap-2 sm:gap-3">
                <p className="text-indigo-200 dark:text-gray-300 capitalize text-sm sm:text-base">
                  {profileData.user.role === 'institution' ? (
                    <span className="flex items-center justify-center sm:justify-start">
                      <Building className="h-4 w-4 mr-1" />
                      {profileData.user.institutionType || 'Instituição'}
                    </span>
                  ) : profileData.user.role === 'instructor' ? (
                    <span className="flex items-center justify-center sm:justify-start">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      Instrutor
                    </span>
                  ) : profileData.user.role === 'student' ? (
                    <span className="flex items-center justify-center sm:justify-start">
                      <User className="h-4 w-4 mr-1" />
                      Estudante
                    </span>
                  ) : (
                    <span className="flex items-center justify-center sm:justify-start">
                      <ShieldAlert className="h-4 w-4 mr-1" />
                      Administrador
                    </span>
                  )}
                </p>
                
                {profileData.user.institutionName && (
                  <p className="text-indigo-200 dark:text-gray-300 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {profileData.user.institutionName}
                  </p>
                )}
              </div>
              
              {profileData.user.bio && (
                <div className="mt-4 p-3 sm:p-4 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Info className='w-4 h-4 text-white dark:text-custom-primary' />
                    </div>
                    <p className="text-indigo-100 dark:text-gray-300 leading-relaxed text-xs sm:text-sm font-light break-words">
                      {profileData.user.bio}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                {profileData.user.website && (
                  <a 
                    href={profileData.user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-indigo-200 hover:text-white break-all"
                  >
                    <LinkIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    {profileData.user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                
                {isOwnProfile && profileData.user.email && (
                  <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-indigo-200 break-all">
                    <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                    {profileData.user.email}
                  </div>
                )}
                
                {profileData.user.contactPhone && (
                  <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-indigo-200">
                    <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                    {profileData.user.contactPhone}
                  </div>
                )}

                <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-indigo-200">
                  <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                  Membro desde {formatDate(profileData.user.createdAt)}
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6 text-indigo-100 dark:text-gray-300">
                <div className="flex items-center space-x-1 text-xs sm:text-sm">
                  <User className="h-4 w-4" />
                  <span className='text-sm'><strong>{profileData.stats.followersCount}</strong> acompanhantes</span>
                </div>
                <div className="flex items-center space-x-1 text-xs sm:text-sm">
                  <UserPlus className="h-4 w-4" />
                  <span className='text-sm'><strong>{profileData.stats.followingCount}</strong> acompanhando</span>
                </div>
                {profileData.user.role === 'instructor' && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span className='text-sm'><strong>{profileData.stats.publishedCoursesCount}</strong> cursos</span>
                  </div>
                )}
                {profileData.user.role === 'student' && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm">
                    <Award className="h-4 w-4" />
                    <span className='text-sm'><strong>{profileData.stats.completedCourses}</strong> concluídos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-4">
          <TabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={getTabsConfig()}
          />

          <div className="mt-6">
            {activeTab === 'profile' && (
              profileData.user.role === 'institution' ? (
                <InstitutionProfile
                  institutionData={profileData.user}
                  onSubmit={handleUpdateProfile}
                  errors={validationErrors}
                  loading={updatingProfile}
                  isEditable={isOwnProfile && isEditing}
                />
              ) : (
                <ProfileForm
                  userData={profileData.user}
                  onSubmit={handleUpdateProfile}
                  role={profileData.user.role}
                  errors={validationErrors}
                  loading={updatingProfile}
                  isEditable={isOwnProfile && isEditing}
                />
              )
            )}

            {activeTab === 'stats' && (
              <UserStats 
                userId={profileData.user.userId} 
                role={profileData.user.role} 
                isOwnProfile={isOwnProfile}
                stats={profileData.stats}
              />
            )}

            {activeTab === 'activities' && (
              <ActivitiesTab 
                user={profileData.user}
                isOwnProfile={isOwnProfile}
              />
            )}

            {activeTab === 'connections' && (
              <ConnectionsTab 
                userId={profileData.user.userId}
                isOwnProfile={isOwnProfile}
              />
            )}

            {activeTab === 'interests' && profileData.user.role === 'student' && (
              <InterestsSelector
                selectedInterests={profileData.user.interests || []}
                onSave={(interests) => handleUpdateProfile({ interests })}
                editable={isOwnProfile}
              />
            )}

            {activeTab === 'expertise' && 
              ['instructor', 'institution'].includes(profileData.user.role) && (
              <ExpertiseEditor
                expertise={profileData.user.expertise || []}
                onSave={(expertise) => handleUpdateProfile({ expertise })}
                editable={isOwnProfile}
                placeholder={
                  profileData.user.role === 'institution' 
                    ? 'Adicione programas acadêmicos oferecidos' 
                    : 'Adicione suas áreas de expertise'
                }
              />
            )}

            {activeTab === 'programs' && profileData.user.role === 'institution' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Programas Acadêmicos</h3>
                <ExpertiseEditor
                  expertise={profileData.user.academicPrograms || []}
                  onSave={(academicPrograms) => handleUpdateProfile({ academicPrograms })}
                  placeholder="Adicione programas oferecidos (ex: Graduação em Engenharia)"
                  suggestions={[
                    'Graduação', 'Pós-Graduação', 'MBA', 
                    'Mestrado', 'Doutorado', 'Extensão',
                    'Cursos Técnicos', 'Educação Continuada'
                  ]}
                  editable={isOwnProfile}
                />
              </div>
            )}

            {activeTab === 'management' && profileData.user.role === 'institution' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Gestão Institucional</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Ferramentas de gestão para sua instituição educacional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/institution/courses')}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                  >
                    <h4 className="font-medium flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                      Gerenciar Cursos
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Crie e edite cursos oferecidos
                    </p>
                  </button>
                  <button
                    onClick={() => navigate('/institution/instructors')}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                  >
                    <h4 className="font-medium flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                      Gerenciar Instrutores
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Adicione e remova instrutores
                    </p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <SocialMediaLinks
                socialMedia={profileData.user.socialMedia || {}}
                onSave={(socialMedia) => handleUpdateProfile({ socialMedia })}
                editable={isOwnProfile}
              />
            )}

            {activeTab === 'messages' && isOwnProfile && (
              <MessagePreferences
                preferences={profileData.user.messagePreferences}
                onSave={(prefs) => handleUpdateProfile({ messagePreferences: prefs })}
                role={profileData.user.role}
              />
            )}

            {activeTab === 'notifications' && isOwnProfile && (
              <NotificationPreferences
                preferences={profileData.user.notificationPreferences}
                onSave={(prefs) => handleUpdateProfile({ notificationPreferences: prefs })}
              />
            )}

            {activeTab === 'privacy' && isOwnProfile && (
              <PrivacySettings
                isPrivate={profileData.user.isPrivate}
                onPrivacyChange={handlePrivacyChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}