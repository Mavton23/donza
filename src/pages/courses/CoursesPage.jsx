import { useState, useEffect } from 'react';
import { FileEdit, CheckCircle, Archive } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '@/components/courses/CourseCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Tabs from '@/components/common/Tabs';
import api from '../../services/api';
import { Plus } from 'lucide-react';

// Status possíveis para os cursos
const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Configuração das tabs
const TABS_CONFIG = [
  {
    id: COURSE_STATUS.DRAFT,
    label: 'Rascunhos',
    icon: FileEdit
  },
  {
    id: COURSE_STATUS.PUBLISHED,
    label: 'Publicados',
    icon: CheckCircle
  },
  {
    id: COURSE_STATUS.ARCHIVED,
    label: 'Arquivados',
    icon: Archive
  }
];

export default function CoursesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(COURSE_STATUS.PUBLISHED);
  const [counts, setCounts] = useState({
    [COURSE_STATUS.DRAFT]: 0,
    [COURSE_STATUS.PUBLISHED]: 0,
    [COURSE_STATUS.ARCHIVED]: 0
  });

  // Verifica se o usuário atual é o dono dos cursos
  const isOwner = user?.userId === userId || user?.role === 'admin';

  // Valida a role
  const isInstructor = user?.role === 'instructor';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Primeiro buscamos as contagens para cada status
        const countsResponse = await api.get(`/courses/courses/${user.userId}/counts`);
      setCounts({
        [COURSE_STATUS.DRAFT]: countsResponse.data.data.draft || 0,
        [COURSE_STATUS.PUBLISHED]: countsResponse.data.data.published || 0,
        [COURSE_STATUS.ARCHIVED]: countsResponse.data.data.archived || 0
      });
        
        // Depois buscamos os cursos para a tab ativa
        const response = await api.get(`/courses/courses/${user.userId}`, {
          params: { status: activeTab }
        });
        
      const formattedCourses = response.data.data.courses.map(course => ({
        ...course,
        coverUrl: course.coverImageUrl || '/images/thumbnail-placeholder.svg',
        lessonsCount: course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0,
        enrolledCount: course.metrics?.enrollments || 0,
        instructor: course.organizerId || {
          name: course.organizer?.username,
          avatarUrl: '/images/placeholder.png'
        }
      }));
      
      setCourses(formattedCourses);
      } catch (err) {
        setError('Erro ao carregar cursos. Tente novamente.');
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, activeTab]);

  // Atualiza as tabs com as contagens
  const tabsWithCounts = TABS_CONFIG.map(tab => ({
    ...tab,
    count: counts[tab.id] || 0
  }));

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Cursos
          </h1>
          {!loading && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {counts[activeTab]} cursos {getStatusLabel(activeTab).toLowerCase()}
            </p>
          )}
        </div>
        
        {isOwner || isInstructor && (
          <Link
            to="/instructor/courses/new"
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo curso
          </Link>
        )}
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={tabsWithCounts} 
        activeTab={activeTab} 
        onChange={handleTabChange}
        className="mb-8"
      />

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : courses.length === 0 ? (
        <EmptyState
          title={`Nenhum curso ${getStatusLabel(activeTab).toLowerCase()} encontrado`}
          action={
            isOwner || isInstructor && activeTab !== COURSE_STATUS.DRAFT ? (
              <Link
                to="/instructor/courses/new"
                className="mt-4 px-4 py-2 bg-custom-primary text-white font-medium rounded-md hover:bg-custom-primary-hover transition-colors"
              >
                Criar Novo Curso
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course.courseId}
              course={course}
              showInstructorActions={isOwner}
              statusBadge={true}
              showStatus={true}
              variant="instructor"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status) {
  const tab = TABS_CONFIG.find(t => t.id === status);
  return tab ? tab.label : '';
}