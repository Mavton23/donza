import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function useLessonNavigation(course, enrollment) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para encontrar a primeira lição disponível
  const findFirstLessonId = () => {
    if (!course?.modules?.length) return null;
    
    // Encontra o primeiro módulo com lições
    const firstModuleWithLessons = course.modules.find(
      module => module.lessons?.length > 0
    );
    
    return firstModuleWithLessons?.lessons[0]?.lessonId || null;
  };

  // Inicializa a lição ativa
  useEffect(() => {
    if (course && enrollment) {
      const lessonId = enrollment.lastAccessedLesson || findFirstLessonId();
      if (lessonId) {
        setActiveLesson(lessonId);
      }
    }
  }, [course, enrollment]);

  // Atualiza a lição atual no servidor
  const handleLessonChange = async (lessonId) => {
    if (!enrollment || !course?.courseId) {
      setError('Enrollment or course data missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.patch(`/enrollments/${enrollment.enrollmentId}`, {
        lastAccessedLesson: lessonId
      });
      setActiveLesson(lessonId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lesson progress');
      console.error('Lesson navigation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    activeLesson, 
    handleLessonChange, 
    loading,
    error
  };
}