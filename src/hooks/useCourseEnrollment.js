import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function useCourseEnrollment(courseId) {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função principal de verificação de matrícula
  const fetchEnrollment = useCallback(async () => {
    if (!user || !courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}/enroll/${user.userId}`);
      
      if (response.data.isEnrolled) {
        setEnrollment(response.data.enrollment);
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setEnrollment(null);
      } else {
        setError(err.response?.data?.message || 'Erro ao verificar matrícula');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  // Atualização de progresso
  const updateProgress = useCallback(async (progressData) => {
    try {
      const response = await api.patch(
        `/users/${user.userId}/enrollments/${courseId}`,
        progressData
      );
      setEnrollment(prev => ({ ...prev, ...response.data }));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Falha ao atualizar progresso');
    }
  }, [courseId, user]);

  // Efeito para carregar dados inicialmente
  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  return {
    enrollment,
    loading,
    error,
    refresh: fetchEnrollment,
    updateProgress,
    isEnrolled: !!enrollment
  };
}