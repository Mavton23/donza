import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import LessonFormBasic from '@/components/lessons/LessonFormBasic';
import LessonFormContent from '@/components/lessons/LessonFormContent';
import LessonFormPublishing from '@/components/lessons/LessonFormPublishing';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const steps = [
  'Informações Básicas',
  'Conteúdo da Aula',
  'Opções de Publicação'
];

export default function LessonEdit() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modules, setModules] = useState([]);
  const [isIndependent, setIsIndependent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons/lesson/${lessonId}`);
        const lessonData = response.data.data;
        
        setLesson(lessonData);
        setIsIndependent(!lessonData.moduleId);

        // Se a lição estiver vinculada, carrega os módulos do curso
        if (lessonData.moduleId) {
          const modulesRes = await api.get(`/modules/${lessonData.module.courseId}/modules`);
          setModules(modulesRes.data.modules || []);
        } else {
          // Para lições independentes, carrega todos os módulos disponíveis
          const modulesRes = await api.get('/modules/list');
          setModules(modulesRes.data.modules || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar a aula');
        toast.error(err.response?.data?.message || 'Falha ao carregar a aula');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleUpdate = async (updatedData) => {
    try {
      setLoading(true);
      
      // Prepara os dados para envio
      const payload = { ...updatedData };
      if (isIndependent) {
        payload.moduleId = null;
        payload.courseId = null;
      }

      const response = await api.put(`/lessons/independent/${lessonId}`, payload);
      
      setLesson(response.data.data);
      setError('');
      toast.success('Aula atualizada com sucesso!');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar a aula');
      toast.error(err.response?.data?.message || 'Falha ao atualizar a aula');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.put(`/lessons/${lessonId}`, {
        isPublished: true
      });
      toast.success('Aula publicada com sucesso!');
      navigate('/instructor/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao publicar a aula');
      toast.error(err.response?.data?.message || 'Falha ao publicar a aula');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Determina o endpoint correto baseado no tipo de aula
      const endpoint = isIndependent 
        ? `/lessons/independent/${lessonId}`
        : `/lessons/${lessonId}`;
      
      await api.delete(endpoint);
      
      toast.success('Aula excluída com sucesso!');
      navigate('/instructor/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao excluir a aula');
      toast.error(err.response?.data?.message || 'Falha ao excluir a aula');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const toggleIndependent = () => {
    setIsIndependent(!isIndependent);
    setLesson(prev => ({
      ...prev,
      moduleId: '',
      courseId: ''
    }));
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  if (loading) return <LoadingSpinner fullScreen={true} />;
  if (!lesson) return <div>Aula não encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Editando: {lesson.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Estado: {lesson.isPublished ? (
                <span className="text-green-600">Publicada</span>
              ) : (
                <span className="text-yellow-600">Rascunho</span>
              )}
              {lesson.moduleId && (
                <span className="ml-4">Módulo: {lesson.module?.title}</span>
              )}
            </p>
          </div>
          
          <button
            onClick={openDeleteModal}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" />
                Excluindo...
              </>
            ) : (
              'Excluir Aula'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <LessonFormBasic
              lessonData={lesson}
              setLessonData={setLesson}
              modules={modules}
              hasModuleId={!!lesson.moduleId}
              isIndependent={isIndependent}
              toggleIndependent={toggleIndependent}
            />
          )}

          {currentStep === 1 && (
            <LessonFormContent
              lessonData={lesson}
              setLessonData={setLesson}
            />
          )}

          {currentStep === 2 && (
            <LessonFormPublishing
              lessonData={lesson}
              setLessonData={setLesson}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={() => handleUpdate(lesson)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Salvar alterações
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Aula"
        message={`Tem certeza de que deseja excluir a aula "${lesson.title}"? ${
          isIndependent 
            ? 'Esta ação é irreversível e a aula será removida permanentemente.' 
            : 'A aula será removida do módulo atual.'
        }`}
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}