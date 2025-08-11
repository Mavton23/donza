import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ModuleList({ isEnrolled, courseId }) {
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/course/${courseId}`);
        
        setCourseData(response.data.data.course);
        
        // Ordenar módulos pela propriedade order
        const sortedModules = [...response.data.data.course.modules].sort((a, b) => a.order - b.order);
        setCourseData(prev => ({
          ...prev,
          modules: sortedModules
        }));

        // Expandir automaticamente o primeiro módulo
        if (sortedModules.length > 0) {
          setExpandedModules([sortedModules[0].moduleId]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isEnrolled]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isModuleLocked = (module) => {
    if (!courseData.isPublic && !isEnrolled) return true;
    
    return false;
  };

  const isLessonCompleted = (lesson) => {
    // TO DO: lógica de progresso do usuário
    return false;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!courseData) return <div>Course not found</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {courseData.title}
        </h2>
        {courseData.shortDescription && (
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {courseData.shortDescription}
          </p>
        )}
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Duração: {courseData.duration} horas</span>
          <span className="mx-2">•</span>
          <span>Nível: {courseData.level === 'beginner' ? 'Iniciante' : courseData.level}</span>
        </div>
      </div>

      {courseData.modules?.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Este curso ainda não possui módulos cadastrados
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {courseData.modules.map((module) => {
            const locked = isModuleLocked(module);
            return (
              <li key={module.moduleId}>
                <div 
                  onClick={() => !locked && toggleModule(module.moduleId)}
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer ${
                    locked ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    {expandedModules.includes(module.moduleId) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 mr-3" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <h3 className={`font-medium ${
                      locked 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {module.title}
                    </h3>
                  </div>
                  {locked && (
                    <span className="flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                      <Lock className="h-3 w-3 mr-1" />
                      Bloqueado
                    </span>
                  )}
                </div>

                {expandedModules.includes(module.moduleId) && (
                  <ul className="bg-gray-50 dark:bg-gray-700/30 pl-14 pr-6 divide-y divide-gray-200 dark:divide-gray-700">
                    {module.lessons?.length > 0 ? (
                      module.lessons.map((lesson) => {
                        const completed = isLessonCompleted(lesson);
                        return (
                          <li key={lesson.lessonId} className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600 mr-3" />
                                )}
                                <Link
                                  to={locked ? '#' : `/courses/${courseId}/modules/${module.moduleId}/lessons/${lesson.lessonId}`}
                                  className={`text-sm ${
                                    locked
                                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                      : completed
                                        ? 'text-gray-600 dark:text-gray-300'
                                        : 'text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400'
                                  }`}
                                >
                                  {lesson.title}
                                </Link>
                              </div>
                              {lesson.duration && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {lesson.duration} min
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="py-3 text-sm text-gray-500 dark:text-gray-400">
                        Este módulo ainda não possui aulas
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}