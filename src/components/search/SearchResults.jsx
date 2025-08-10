import { React, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  BookOpen, 
  User, 
  Users, 
  Calendar, 
  Building, 
  AlertCircle,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { formatFollowers } from '@/utils/formatFollowers';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Tabs from '../common/Tabs';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({
    all: [],
    courses: [],
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
          all: Array.isArray(response.data.all) ? response.data.all : [],
          courses: Array.isArray(response.data.courses) ? response.data.courses : [],
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
        all: [],
        courses: [],
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
          all: [],
          courses: [],
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
    { id: 'all', name: 'Tudo', count: results.all.length, icon: Search },
    { id: 'courses', name: 'Cursos', count: results.courses.length, icon: BookOpen },
    { id: 'users', name: 'Usuários', count: results.users.length, icon: User },
    { id: 'instructors', name: 'Instrutores', count: results.instructors.length, icon: GraduationCap },
    { id: 'institutions', name: 'Instituições', count: results.institutions.length, icon: Building },
    { id: 'events', name: 'Eventos', count: results.events.length, icon: Calendar }
  ];

  const currentResults = activeTab === 'all' ? results.all : results[activeTab];
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
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
        {activeTab === 'all' ? (
          <MixedResults results={currentResults} />
        ) : (
          <CategoryResults 
            results={currentResults} 
            type={activeTab} 
          />
        )}
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
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
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
          className="mb-6"
        />
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

const MixedResults = (({ results }) => (
  <div className="space-y-6">
    {results.map((result) => {
      const Component = {
        course: CourseResult,
        user: UserResult,
        instructor: InstructorResult,
        institution: InstitutionResult,
        event: EventResult
      }[result.type];

      return Component ? <Component key={`${result.type}-${result.id}`} {...{[result.type]: result}} /> : null;
    })}
  </div>
));

const CategoryResults = (({ results, type }) => {
  const gridClasses = {
    courses: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    users: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    instructors: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    institutions: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    events: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }[type];

  const ResultComponent = {
    courses: CourseResult,
    users: UserResult,
    instructors: InstructorResult,
    institutions: InstitutionResult,
    events: EventResult
  }[type];

  return (
    <div className={`grid ${gridClasses} gap-6`}>
      {results.map((item) => {
        const props = { [type]: item };
        return <ResultComponent key={item.userId || item.id} {...props} />;
      })}
    </div>
  );
});

const CardWrapper = ({ children, icon: Icon, iconColor = 'indigo', onClick, clickable = false }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
        clickable ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        {Icon && (
          <div className={`${colorClasses[iconColor]} rounded-lg p-3 mr-4`}>
            <Icon size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const CourseResult = ({ course }) => {
  if (!course) return null;
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/courses/${course?.slug}`);
  };

  return (
    <CardWrapper icon={BookOpen} clickable onClick={handleCourseClick}>
      <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
        {course.description}
      </p>
      <div className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
        Ver detalhes do curso
      </div>
  </CardWrapper>
  )
};

const UserResult = ({ user }) => {
  if (!user) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${user?.username}`);
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
          src={user?.avatarUrl || '/images/placeholder.png'} 
          alt={user?.username}
          className="h-10 w-10 rounded-full mr-4 mt-1"
        />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {user?.fullName || user?.username}
          </h3>
  
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
            <span>@{user?.username}</span>
            <span className="text-xs">•</span>
            <span>{formatFollowers(user?.followersCount) || 0} seguidores</span>
          </div>
  
          {user?.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {user?.bio}
            </p>
          )}
  
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver perfil completo
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

const InstructorResult = ({ instructor }) => {
  if (!instructor) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${instructor.username}`);
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
          src={instructor?.avatarUrl || '/images/placeholder.png'} 
          alt={instructor?.username}
          className="h-10 w-10 rounded-full mr-4 mt-1"
        />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {instructor?.fullName || instructor?.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {instructor?.expertise?.slice(0, 3).join(', ') || 'Instrutor'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{instructor?.username} • {formatFollowers(instructor?.followersCount) || 0} seguidores
          </p>
        </div>
      </div>
  
      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
        <BookOpen size={14} className="text-gray-500 dark:text-gray-400" />
        <span>{instructor?.courseCount || 0} cursos</span>
        <span className="text-xs">•</span>
        <span>{instructor?.studentCount || 0} alunos</span>
      </div>
  
      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        Ver perfil completo
      </div>
    </CardWrapper>
  );
}

const InstitutionResult = ({ institution }) => {
  if (!institution) return null;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${institution.fullName}`);
  };

  return (
    <CardWrapper 
      icon={Building} 
      iconColor="purple"
      clickable
      onClick={handleProfileClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white">
        {institution.institutionName}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {institution.institutionType}
      </p>
  
      <p className="text-sm text-gray-500 dark:text-gray-400">
        @{institution.username} • {formatFollowers(institution.followersCount) || 0} seguidores
      </p>
  
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
        {institution.academicPrograms?.slice(0, 3).join(', ')}
      </p>
  
      <div className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline">
        Ver instituição
      </div>
    </CardWrapper>
  );
};

const EventResult = ({ event }) => (
  // TO DO: Create go to event
  <CardWrapper icon={Calendar} iconColor="green">
    <h3 className="font-medium text-gray-900 dark:text-white">
      {event.title}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {new Date(event.date).toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {event.isOnline ? 'Evento Online' : event.location}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
      {event.description}
    </p>
    <div className="mt-3 flex justify-between items-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {event.participantCount || 0} participantes
      </span>
      <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
        Detalhes
      </button>
    </div>
  </CardWrapper>
);

export default SearchResults;