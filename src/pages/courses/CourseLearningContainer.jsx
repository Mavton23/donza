import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CourseLearningLayout from './CourseLearningLayout';
import CourseContentBrowser from './CourseContentBrowser';
import CourseIntroduction from '@/components/courses/CourseIntroduction';
import LessonViewer from '@/components/courses/LessonViewer';
import ErrorState from '@/components/common/ErrorState';

export default function CourseLearningContainer() {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState({
    progress: 0,
    completedLessons: 0,
    totalLessons: 0,
    enrollment: null
  });
  const [selectedLesson, setSelectedLesson] = useState(null);


  // Busca os dados do curso e progresso em paralelo
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtém o courseId do estado de navegação ou tenta extrair da URL
      const courseId = location.state?.courseId;

      if (!courseId) {
        throw new Error('Course ID not available');
      }

      // Executa ambas requisições em paralelo
      const [courseResponse, progressResponse] = await Promise.all([
        api.get(`/courses/course/${courseId}`),
        user ? api.get(`/courses/${slug}/progress`) : Promise.resolve(null)
      ]);

      const courseData = courseResponse.data.data.course;
      setCourse(courseData);

      if (progressResponse) {
        const progressInfo = progressResponse.data.data;
        setProgressData({
          progress: progressInfo.progress,
          completedLessons: progressInfo.completedLessons,
          totalLessons: progressInfo.totalLessons,
          enrollment: progressInfo.enrollment
        });

        // Verifica se há última lição acessada no enrollment
        if (progressInfo.enrollment?.lastAccessed) {
          // TO DO: lógica para encontrar a lição pelo lastAccessed
        }
      } else {
        // Define o total de lições mesmo para usuários não logados
        const totalLessons = courseData.modules.reduce(
          (acc, module) => acc + (module.lessons?.length || 0), 0
        );
        setProgressData(prev => ({
          ...prev,
          totalLessons
        }));
      }

      // Seleciona automaticamente a primeira lição não concluída ou a primeira disponível
      const completedLessonIds = progressResponse?.data.data?.enrollment?.completedLessons || [];
      const firstUncompletedLesson = findFirstUncompletedLesson(
        courseData.modules, 
        completedLessonIds
      );
      
      setSelectedLesson(firstUncompletedLesson || findFirstAvailableLesson(courseData.modules));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load course data');
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, user, location.state]);

  // Encontra a primeira lição não concluída
  const findFirstUncompletedLesson = (modules, completedLessonIds = []) => {
    if (!modules) return null;
    
    for (const module of modules) {
      const lessons = module.lessons || [];
      for (const lesson of lessons) {
        if (!completedLessonIds.includes(lesson.lessonId)) {
          return {
            ...lesson,
            moduleTitle: module.title,
            moduleId: module.moduleId
          };
        }
      }
    }
    return null;
  };

  // Encontra a primeira lição disponível
  const findFirstAvailableLesson = (modules) => {
    if (!modules?.length) return null;
    
    // Encontra o primeiro módulo com lições
    const firstModuleWithLessons = modules.find(m => m.lessons?.length > 0);
    if (!firstModuleWithLessons) return null;
    
    return {
      ...firstModuleWithLessons.lessons[0],
      moduleTitle: firstModuleWithLessons.title,
      moduleId: firstModuleWithLessons.moduleId
    };
  };

  // Atualiza o progresso quando uma lição é completada
  const handleLessonComplete = useCallback(async (lessonId) => {
    if (!user || !course) return;

    try {
      await api.post(`/lessons/${lessonId}/complete`, {
        courseId: course.courseId
      });

      // Atualiza o estado local
      setProgressData(prev => {
        const newCompletedLessons = prev.completedLessons + 1;
        const newProgress = Math.round((newCompletedLessons / prev.totalLessons) * 100);
        
        return {
          ...prev,
          progress: newProgress,
          completedLessons: newCompletedLessons
        };
      });

      // Encontra a próxima lição não concluída
      const nextLesson = findFirstUncompletedLesson(
        course.modules,
        [...Array(progressData.completedLessons + 1).keys()].map(String)
      );
      
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
      toast.error(err.response?.data?.message || 'Error marking lesson as complete');
    }
  }, [user, course, progressData.completedLessons]);

  // Busca os dados quando o componente monta ou quando o slug/user muda
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={fetchCourseData}
        retryLabel="Try Again"
      />
    );
  }

  if (!course) {
    return <ErrorState message="Course not found or unavailable" />;
  }

  return (
    <CourseLearningLayout
      course={course}
      progress={progressData.progress}
      sidebar={
        <CourseContentBrowser
          course={course}
          selectedId={selectedLesson?.lessonId}
          progressData={{
            completedLessons: progressData.completedLessons,
            totalLessons: progressData.totalLessons
          }}
          onSelect={(lesson) => {
          setSelectedLesson(lesson);
          window.history.pushState(null, '', `/courses/${course.slug}/lessons/${lesson.lessonId}`);
        }}
        />
      }
      mainContent={
        selectedLesson ? (
          <LessonViewer
            key={selectedLesson.lessonId}
            lesson={selectedLesson}
            courseId={course.courseId}
            progress={progressData}
            onComplete={handleLessonComplete}
          />
        ) : (
          <CourseIntroduction 
            course={course} 
            progress={progressData}
          />
        )
      }
    />
  );
}