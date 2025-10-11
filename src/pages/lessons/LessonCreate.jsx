import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import FormStepper from '@/components/common/FormStepper';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LessonFormBasic from '@/components/lessons/LessonFormBasic';
import LessonFormContent from '@/components/lessons/LessonFormContent';
import LessonFormPublishing from '@/components/lessons/LessonFormPublishing';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';

const steps = [
  'Informações Básicas',
  'Conteúdo da Aula',
  'Opções de Publicação'
];

export default function LessonCreate() {
  usePageTitle();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const { moduleId, courseId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonData, setLessonData] = useState({
    title: '',
    content: '',
    mediaFile: null,
    mediaUrl: '',
    duration: 0,
    order: 0,
    lessonType: 'video',
    level: 'beginner',
    isFree: true,
    price: 0,
    isPublished: false,
    moduleId: moduleId || '',
    courseId: courseId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [isIndependent, setIsIndependent] = useState(!moduleId);
  const [uploadProgress, setUploadProgress] = useState(0);

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

      // Validações específicas por tipo de aula
      if (lessonData.lessonType === 'video' && !lessonData.mediaFile && !lessonData.mediaUrl) {
        throw new Error('É necessário fornecer um arquivo de vídeo ou URL para aulas em vídeo');
      }

      if (lessonData.lessonType === 'pdf' && !lessonData.mediaFile) {
        throw new Error('É necessário fornecer um arquivo PDF para aulas em PDF');
      }

      if (lessonData.lessonType === 'audio' && !lessonData.mediaFile) {
        throw new Error('É necessário fornecer um arquivo de áudio para aulas em áudio');
      }

      if (lessonData.lessonType === 'text' && !lessonData.content) {
        throw new Error('Conteúdo é obrigatório para aulas em texto');
      }

      // Validação de preço para aulas pagas
    if (!lessonData.isFree) {
      const price = parseFloat(lessonData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Preço deve ser maior que 0 para aulas pagas');
      }
      if (price > 10000) {
        throw new Error('Preço máximo é 10.000 MZN');
      }
    }

      // Criar FormData para envio do arquivo
      const formData = new FormData();
      
      // Adicionar campos básicos
      formData.append('title', lessonData.title);
      formData.append('content', lessonData.content);
      formData.append('lessonType', lessonData.lessonType);
      formData.append('level', lessonData.level);
      formData.append('duration', lessonData.duration);
      formData.append('order', lessonData.order);
      formData.append('isFree', lessonData.isFree); 
      formData.append('price', lessonData.price); 
      formData.append('isPublished', lessonData.isPublished);
      formData.append('mediaUrl', lessonData.mediaUrl);
      
      // Adicionar arquivo de mídia se existir
      if (lessonData.mediaFile) {
        formData.append('mediaFile', lessonData.mediaFile);
      }
      
      // Adicionar informações de módulo/curso se não for independente
      if (!isIndependent) {
        formData.append('moduleId', lessonData.moduleId);
        if (lessonData.courseId) {
          formData.append('courseId', lessonData.courseId);
        }
      }

      // Configuração para acompanhar progresso do upload
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const endpoint = isIndependent 
        ? '/lessons/independent' 
        : `/courses/${courseId}/modules/${moduleId}/lessons`;

      const response = await api.post(endpoint, formData, config);
      
      navigate(`/instructor/lessons/${response.data.data.lessonId}/edit`, {
        state: { successMessage: 'Aula criada com sucesso!' }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Falha ao criar aula');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
            uploadProgress={uploadProgress}
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

          {loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Enviando arquivo...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {renderFormStep()}

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? 'Criar Aula' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}