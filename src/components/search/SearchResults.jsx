import { React, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  BookOpen, 
  User, 
  Users,
  Users2,
  Lock,
  Globe,
  MessageSquare,
  Calendar, 
  Building, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { formatFollowers } from '@/utils/formatFollowers';
import { formatPrice } from '@/utils/formatPrice';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Tabs from '../common/Tabs';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [results, setResults] = useState({
    courses: [],
    communities: [],
    users: [],
    instructors: [],
    institutions: [],
    events: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setHasSearched(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      
      const response = await api.get('/search', {
        params: { q: query.trim() },
        timeout: 10000
      });

      if (response.data && typeof response.data === 'object') {
        setResults({
          courses: Array.isArray(response.data.courses) ? response.data.courses : [],
          communities: Array.isArray(response.data.communities) ? response.data.communities : [],
          users: Array.isArray(response.data.users) ? response.data.users : [],
          instructors: Array.isArray(response.data.instructors) ? response.data.instructors : [],
          institutions: Array.isArray(response.data.institutions) ? response.data.institutions : [],
          events: Array.isArray(response.data.events) ? response.data.events : []
        });
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 
        err.code === 'ECONNABORTED' ? 
        'A busca está demorando muito. Tente novamente.' : 
        'Erro ao buscar resultados');
      setResults({
        courses: [],
        communities: [],
        users: [],
        instructors: [],
        institutions: [],
        events: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults({
          courses: [],
          communities: [],
          users: [],
          instructors: [],
          institutions: [],
          events: []
        });
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [location.search, performSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  const tabs = [
    { id: 'courses', name: 'Cursos', count: results.courses.length, icon: BookOpen },
    { id: 'users', name: 'Usuários', count: results.users.length, icon: User },
    { id: 'instructors', name: 'Instrutores', count: results.instructors.length, icon: GraduationCap },
    { id: 'institutions', name: 'Instituições', count: results.institutions.length, icon: Building },
    { id: 'events', name: 'Eventos', count: results.events.length, icon: Calendar },
    { id: 'communities', name: 'Comunidades', count: results.communities.length, icon: Users2 }
  ];

  const currentResults = results[activeTab];
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" fullScreen />
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          title="Erro na busca"
          description={error}
          icon={AlertCircle}
          action={
            <button 
              onClick={() => performSearch(searchQuery)}
              className="mt-4 px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover transition-colors"
            >
              Tentar novamente
            </button>
          }
        />
      );
    }

    if (!hasSearched) {
      return (
        <EmptyState
          title="Busque por cursos, instrutores ou eventos"
          description="Digite na barra de pesquisa para encontrar o que procura"
          icon={Search}
        />
      );
    }

    if (currentResults.length === 0) {
      return (
        <EmptyState
          title={`Nenhum ${activeTabData?.name.toLowerCase()} encontrado`}
          description={`Não encontramos resultados para "${searchQuery}" nesta categoria`}
          icon={activeTabData?.icon || Search}
        />
      );
    }

    return (
      <div className="mt-6">
        <CategoryResults 
          results={currentResults} 
          type={activeTab} 
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cursos, instrutores, eventos..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-custom-primary text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Barra de pesquisa"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Limpar pesquisa"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500 transition-colors" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabs */}
      {hasSearched && !loading && (
        <Tabs 
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6 overflow-x-auto"
        />
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

const CategoryResults = (({ results, type }) => {
  const gridClasses = {
    courses: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    users: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    instructors: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    institutions: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    events: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    communities: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[type];

  const ResultComponent = {
    courses: CourseResult,
    communities: CommunityResult,
    users: UserResult,
    instructors: InstructorResult,
    institutions: InstitutionResult,
    events: EventResult
  }[type];

  return (
    <div className={`grid ${gridClasses} gap-6`}>
      {results.map((item) => (
        <ResultComponent 
          key={item.userId || item.id || item.courseId || item.eventId}
          {...{ [type]: item }}
        />
      ))}
    </div>
  );
});

const CardWrapper = ({ children, icon: Icon, iconColor = 'indigo', onClick, clickable = false }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
  };

  return (
    <div 
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 w-full h-full group ${
        clickable ? 'cursor-pointer hover:ring-2 hover:ring-custom-primary hover:-translate-y-0.5' : ''
      }`}
      onClick={onClick}
    >
      {/* Ícone absoluto premium */}
      {Icon && (
        <div className={`absolute -top-3 -right-3 ${colorClasses[iconColor]} rounded-xl p-3 shadow-lg border-2 border-white dark:border-gray-800 group-hover:scale-110 transition-transform duration-300 z-10`}>
          <Icon size={24} className="drop-shadow-sm" />
        </div>
      )}
      
      {/* Conteúdo principal - espaço preservado */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

const CourseResult = ({ courses }) => {
  if (!courses) return null;
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/courses/${courses?.slug}`);
  };

  return (
    <CardWrapper 
      iconColor='purple'
      icon={BookOpen} 
      clickable 
      onClick={handleCourseClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white">{courses.title}</h3>
      <p 
        className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
        dangerouslySetInnerHTML={{__html: courses.description}}
      />
      <div className="mt-3 text-sm text-custom-primary hover:underline">
        Ver detalhes do curso
      </div>
    </CardWrapper>
  );
};

const UserResult = ({ users }) => {
  if (!users) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${users?.username}`);
  };

  return (
    <CardWrapper 
      icon={User} 
      iconColor="blue"
      onClick={handleProfileClick}
      clickable
    >
      <div className="flex items-start">
        <img 
          src={users?.avatarUrl || '/images/placeholder.png'} 
          alt={users?.username}
          className="h-10 w-10 rounded-full mr-4 mt-1"
        />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {users?.fullName || users?.username}
          </h3>
  
          <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
            <span>@{users?.username}</span>
            <span className="text-xs">•</span>
            <span>{formatFollowers(users?.followersCount) || 0} acompanhantes</span>
          </div>
  
          {users?.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {users?.bio}
            </p>
          )}
  
          <div className="mt-2 text-sm text-custom-primary hover:underline">
            Ver perfil completo
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

const InstructorResult = ({ instructors }) => {
  if (!instructors) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${instructors?.username}`);
  };

  return (
    <CardWrapper 
      icon={GraduationCap} 
      iconColor="blue"
      onClick={handleProfileClick}
      clickable
    >
      <div className="flex items-start">
        <img 
          src={instructors?.avatarUrl || '/images/placeholder.png'} 
          alt={instructors?.username}
          className="h-10 w-10 rounded-full mr-4 mt-1"
        />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {instructors?.fullName || instructors?.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {instructors?.expertise?.slice(0, 3).join(', ') || 'Instrutor'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{instructors?.username} • {formatFollowers(instructors?.followersCount) || 0} acompanhantes
          </p>
        </div>
      </div>
  
      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
        <BookOpen size={14} className="text-gray-500 dark:text-gray-400" />
        <span>{instructors?.courseCount || 0} cursos</span>
        <span className="text-xs">•</span>
        <span>{instructors?.studentCount || 0} alunos ativos</span>
      </div>
  
      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        Ver perfil completo
      </div>
    </CardWrapper>
  );
};

const InstitutionResult = ({ institutions }) => {
  if (!institutions) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${institutions?.username}`);
  };

  return (
    <CardWrapper 
      icon={Building} 
      iconColor="purple"
      clickable
      onClick={handleProfileClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white">
        {institutions.institutionName}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {institutions.institutionType}
      </p>
  
      <p className="text-sm text-gray-500 dark:text-gray-400">
        @{institutions.username} • {formatFollowers(institutions.followersCount) || 0} acompanhantes
      </p>
  
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
        {institutions.academicPrograms?.slice(0, 3).join(', ')}
      </p>
  
      <div className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline">
        Ver instituição
      </div>
    </CardWrapper>
  );
};

const EventResult = ({ events }) => {
  if (!events) return null;
  const navigate = useNavigate();

  const handleEventClick = () => {
    navigate(`/events/${events.eventId}`);
  };

  return (
    <CardWrapper 
      icon={Calendar} 
      iconColor="green"
      onClick={handleEventClick}
      clickable  
    >
      <h3 className="font-medium text-gray-900 dark:text-white">
        {events.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {new Date(events.startDate).toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} até {new Date(events.endDate).toLocaleDateString('pt-BR', {
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {events.isOnline ? 'Evento Online' : events.location}
      </p>
      <div 
        className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: events.description }}
      />
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {formatPrice(events.price)}
      </p>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {events.maxParticipants} participantes (máximo) 
        </span>
        <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
          Detalhes
        </button>
      </div>
    </CardWrapper>
  );
};

const CommunityResult = ({ communities }) => {
  if (!communities) return null;
  const navigate = useNavigate();

  const handleCommunityClick = () => {
    navigate(`/communities/${communities?.communityId}`);
  };

  // Ícone baseado no tipo de membresia
  const getCommunityIcon = () => {
    switch (communities.membershipType) {
      case 'invite_only':
        return Lock;
      case 'approval':
        return Users2;
      default:
        return Globe;
    }
  };

  // Cor baseada no tipo de membresia
  const getIconColor = () => {
    switch (communities.membershipType) {
      case 'invite_only':
        return 'purple';
      case 'approval':
        return 'yellow';
      default:
        return 'pink';
    }
  };

  const CommunityIcon = getCommunityIcon();
  const iconColor = getIconColor();

  return (
    <CardWrapper 
      icon={CommunityIcon}
      iconColor={iconColor}
      clickable 
      onClick={handleCommunityClick}
    >
      <div className="flex items-start">
        {communities.thumbnailImage && (
          <img 
            src={communities.thumbnailImage} 
            alt={communities.name}
            className="h-12 w-12 rounded-lg object-cover mr-4"
          />
        )}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {communities.name}
          </h3>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2 mt-1">
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              {formatFollowers(communities.analytics?.memberCount || 0)} membros
            </span>
            <span className="text-xs">•</span>
            <span className="flex items-center">
              <MessageSquare size={14} className="mr-1" />
              {formatFollowers(communities.analytics?.postCount || 0)} posts
            </span>
            <span className="text-xs">•</span>
            <span className="capitalize">
              {communities.membershipType === 'invite_only' ? 'por convite' : 
               communities.membershipType === 'approval' ? 'com aprovação' : 'aberta'}
            </span>
          </div>

          {communities.shortDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {communities.shortDescription}
            </p>
          )}

          {communities.tags && communities.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {communities.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
              {communities.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  +{communities.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 text-sm text-custom-primary hover:underline">
            Ver comunidade
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default SearchResults;