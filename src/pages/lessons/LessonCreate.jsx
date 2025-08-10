import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import FormStepper from '../../components/common/FormStepper';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LessonFormBasic from '../../components/lessons/LessonFormBasic';
import LessonFormContent from '../../components/lessons/LessonFormContent';
import LessonFormPublishing from '../../components/lessons/LessonFormPublishing';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';

const steps = [
  'Informações Básicas',
  'Conteúdo da Aula',
  'Opções de Publicação'
];

export default function LessonCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const { moduleId, courseId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonData, setLessonData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    order: 0,
    lessonType: 'video',
    isFree: false,
    isPublished: false,
    moduleId: moduleId || '',
    courseId: courseId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [isIndependent, setIsIndependent] = useState(!moduleId);

  if (!isAllowed) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6 text-center">
            <LoadingSpinner fullScreen={false} />
          </div>
        </div>
      );
    }

  useEffect(() => {
    const fetchModules = async () => {
      try {
        let url = '/instructor/modules';
        if (courseId) {
          url = `/courses/${courseId}/modules`;
        }
        const response = await api.get(url);
        setModules(response.data.modules || []);
      } catch (err) {
        console.error('Falha ao carregar módulos', err);
      }
    };
    
    if (!moduleId) {
      fetchModules();
    }
  }, [moduleId, courseId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validação básica
      if (!lessonData.title) {
        throw new Error('Título é obrigatório');
      }

      // Se não for independente, valida o módulo
      if (!isIndependent && !lessonData.moduleId) {
        throw new Error('Seleção de módulo é obrigatória para aulas de curso');
      }

      // Prepara os dados para envio
      const payload = { ...lessonData };
      if (isIndependent) {
        delete payload.moduleId;
        delete payload.courseId;
      }

      const response = await api.post(`/lessons/${courseId}/modules/${moduleId}/lessons`, payload);
      
      navigate(`/instructor/lessons/${response.data.data.lessonId}/edit`, {
        state: { successMessage: 'Aula criada com sucesso!' }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Falha ao criar aula');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const toggleIndependent = () => {
    setIsIndependent(!isIndependent);
    setLessonData(prev => ({
      ...prev,
      moduleId: '',
      courseId: ''
    }));
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LessonFormBasic
            lessonData={lessonData}
            setLessonData={setLessonData}
            modules={modules}
            hasModuleId={!!moduleId}
            isIndependent={isIndependent}
            toggleIndependent={toggleIndependent}
          />
        );
      case 1:
        return (
          <LessonFormContent
            lessonData={lessonData}
            setLessonData={setLessonData}
          />
        );
      case 2:
        return (
          <LessonFormPublishing
            lessonData={lessonData}
            setLessonData={setLessonData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <FormStepper 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
        />

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            renderFormStep()
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {currentStep === steps.length - 1 ? 'Criar Aula' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}