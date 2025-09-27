import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import FormStepper from '@/components/common/FormStepper';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AssignmentFormBasic from '@/components/assignments/AssignmentFormBasic';
import AssignmentFormDetails from '@/components/assignments/AssignmentFormDetails';
import AssignmentFormPublishing from '@/components/assignments/AssignmentFormPublishing';
import useUserStatusCheck from '@/hooks/useUserStatusCheck';
import FileUpload from '@/components/common/FileUpload';
import { formatISO } from 'date-fns';

const steps = [
  'Informações Básicas',
  'Detalhes da Tarefa',
  'Opções de Publicação'
];

export default function AssignmentCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAllowed } = useUserStatusCheck(['approved']);

  const { courseId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    rubric: [],
    attachments: [],
    isPublished: false,
    courseId: courseId || '',
    moduleId: '',
    lessonId: '',
    allowLateSubmissions: false,
    latePenalty: 0,
    submissionFormat: 'both',
    allowedFileTypes: ['pdf', 'docx', 'zip']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

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
    if (courseId) {
      const fetchCourseData = async () => {
        try {
          const [modulesRes, lessonsRes] = await Promise.all([
            api.get(`/courses/${courseId}/modules`),
            api.get(`/courses/${courseId}/lessons`)
          ]);
          setModules(modulesRes.data || []);
          setLessons(lessonsRes.data || []);
        } catch (err) {
          console.error('Falha ao carregar dados do curso', err);
        }
      };
      fetchCourseData();
    }
  }, [courseId]);

  const handleFileUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await api.post('/files/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFileUploadProgress(progress);
        }
      });

      setAssignmentData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...response.data.files]
      }));
    } catch (err) {
      setError('Falha ao fazer upload dos arquivos');
    } finally {
      setFileUploadProgress(0);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAssignmentData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validação
      if (!assignmentData.title || !assignmentData.description) {
        throw new Error('Título e descrição são obrigatórios');
      }

      // Formatar dados para envio
      const payload = {
        ...assignmentData,
        dueDate: assignmentData.dueDate ? formatISO(new Date(assignmentData.dueDate)) : null,
        rubric: Array.isArray(assignmentData.rubric) ? 
          assignmentData.rubric : 
          JSON.parse(assignmentData.rubric || '[]'),
        allowedFileTypes: Array.isArray(assignmentData.allowedFileTypes) ?
          assignmentData.allowedFileTypes :
          assignmentData.allowedFileTypes.split(',').map(item => item.trim())
      };

      const response = await api.post('/api/assignments', payload);
      
      navigate(`/instructor/assignments/${response.data.assignmentId}`, {
        state: { 
          successMessage: 'Tarefa criada com sucesso!',
          newAssignment: response.data
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Falha ao criar a tarefa');
      console.error('Erro na criação da tarefa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validação por etapa
    if (currentStep === 0 && (!assignmentData.title || !assignmentData.description)) {
      setError('Título e descrição são obrigatórios');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AssignmentFormBasic
            assignmentData={assignmentData}
            setAssignmentData={setAssignmentData}
            modules={modules}
            lessons={lessons}
          />
        );
      case 1:
        return (
          <>
            <AssignmentFormDetails
              assignmentData={assignmentData}
              setAssignmentData={setAssignmentData}
            />
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anexos
              </label>
              <FileUpload
                onFileUpload={handleFileUpload}
                progress={fileUploadProgress}
                acceptedTypes=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
              />
              {assignmentData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {assignmentData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="truncate text-sm">{file.name || file.filename}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <AssignmentFormPublishing
            assignmentData={assignmentData}
            setAssignmentData={setAssignmentData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <FormStepper 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
        />

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {renderFormStep()}
              
              <div className="mt-8 flex justify-between border-t pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {currentStep === steps.length - 1 ? 'Criar Tarefa' : 'Próximo'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}