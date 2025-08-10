import { ChevronLeftIcon, MenuIcon, XIcon, EllipsisVerticalIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import CourseProgress from './CourseProgress';
import UserDropdown from '../common/UserDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import api from '@/services/api';
import ThemeToggle from '../common/ThemeToggle';

export default function CourseLearningHeader({ 
  course, 
  progress, 
  onToggleSidebar, 
  isSidebarOpen 
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [completionStats, setCompletionStats] = useState(null);

  // Hotkey para navegação (Ctrl/Cmd + ← volta para dashboard)
  useHotkeys('meta+left, ctrl+left', () => navigate('/dashboard'));

  // Hotkey para alternar sidebar (Ctrl/Cmd + B)
  useHotkeys('meta+b, ctrl+b', () => {
    onToggleSidebar();
  });

  // Busca estatísticas adicionais
  useEffect(() => {
    if (!course?.courseId) return;

    const fetchAdditionalData = async () => {
      try {
        const response = await api.get(`/courses/${course.courseId}/completion-stats`);
        
        setCompletionStats(response.data);
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchAdditionalData();
  }, [course?.courseId, user?.userId]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Lado esquerdo - Navegação e título */}
        <div className="flex items-center space-x-4 min-w-0">
          <button
            onClick={handleGoBack}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Back to dashboard"
            aria-label="Back to dashboard"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isSidebarOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
          
          <div className="min-w-0 hidden md:block">
            <BreadcrumbNavigation 
              courseTitle={course?.title} 
              moduleTitle={completionStats?.currentModule} 
            />
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {course?.title || 'Loading course...'}
            </h1>
            
            {completionStats && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {completionStats.completedModules} of {completionStats.totalModules} modules completed
              </p>
            )}
          </div>
        </div>
        
        {/* Centro - Progresso (visível apenas em telas médias/grandes) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <CourseProgress 
            value={progress?.progress || 0} 
            stats={{
              completed: progress?.completedLessons,
              total: progress?.totalLessons
            }}
          />
        </div>
        
        {/* Lado direito - Ações do usuário */}
        <div className="flex items-center space-x-3">
          {/* Versão mobile do progresso */}
          <div className="md:hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                {Math.floor(progress?.progress || 0)}%
              </span>
            </div>
          </div>
          
          {/* Theme Toggler */}
          <ThemeToggle />
          
          {/* Menu do usuário */}
          <UserDropdown 
            user={user} 
            courseId={course?.courseId} 
          />
          
          {/* Menu de ações do curso (opcional) */}
          <button 
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Course actions"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Barra de progresso secundária para mobile */}
      <div className="md:hidden bg-gray-100 dark:bg-gray-700 h-1.5">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress?.progress || 0}%` }}
        />
      </div>
    </header>
  );
}