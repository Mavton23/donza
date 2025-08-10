import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import CourseForm from '@/components/courses/CourseForm';
import FormStepper from '@/components/common/FormStepper';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';

const steps = [
  'Informações Básicas',
  'Conteúdo do Curso',
  'Preço & Publicação'
];

export default function CourseCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'web',
    level: 'beginner',
    language: 'Portuguese',
    duration: 1,
    requirements: [],
    learningOutcomes: [],
    coverImage: null,
    price: 0,
    currency: 'USD',
    isPublic: true,
    status: 'draft',
    modules: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAllowed) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6 text-center">
          <LoadingSpinner fullScreen={false} />
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (user?.status !== 'approved') {
        throw new Error('Seu perfil precisa ser aprovado para criar cursos');
      }

      const formData = new FormData();
      
      Object.entries(courseData).forEach(([key, value]) => {
        if (key === 'modules') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.post('/courses/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/instructor/courses/${response.data.data.courseId}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar o curso');
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
            <CourseForm
              step={currentStep}
              courseData={courseData}
              setCourseData={setCourseData}
            />
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
              {currentStep === steps.length - 1 ? 'Criar Curso' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}