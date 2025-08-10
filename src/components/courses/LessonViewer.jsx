import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LessonNavigation from './LessonNavigation';
import CompleteLessonButton from './CompleteLessonButton';
import ResourceList from './ResourceList';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'sonner';

export default function LessonViewer({ lesson, courseId, onComplete }) {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!user || !lesson) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/lessons/${lesson.lessonId}/completion-status`);
        setIsCompleted(response.data.isCompleted);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao verificar status de conclusão');
      } finally {
        setLoading(false);
      }
    };

    checkCompletionStatus();
  }, [user, lesson, courseId]);

  const handleComplete = async () => {
    if (!user || !lesson) return;
    
    try {
      setLoading(true);
      await api.post(`/lessons/${lesson.lessonId}/complete`, {
        courseId
      });
      setIsCompleted(true);
      onComplete?.(lesson.lessonId);
      toast.success('Lição marcada como concluída!');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao marcar lição como concluída');
      toast.error('Erro ao concluir lição');
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-4">
            {error || 'Lição não encontrada'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Por favor, selecione uma lição válida no menu lateral.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner className="my-8" />;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-6">
        {lesson.moduleTitle && (
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            {lesson.moduleTitle}
          </h2>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {lesson.title}
        </h1>
      </div>
      
      {lesson.content && (
        <div 
          className="prose dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: lesson.content }} 
        />
      )}
      
      {lesson.externalResources?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Recursos</h3>
          <ResourceList resources={lesson.externalResources} />
        </div>
      )}
      
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        {user && (
          <CompleteLessonButton
            isCompleted={isCompleted}
            onComplete={handleComplete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}