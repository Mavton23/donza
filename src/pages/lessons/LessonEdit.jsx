import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import LessonFormBasic from '@/components/lessons/LessonFormBasic';
import LessonFormContent from '@/components/lessons/LessonFormContent';
import LessonFormPublishing from '@/components/lessons/LessonFormPublishing';

const steps = [
  'Basic Information',
  'Lesson Content',
  'Publishing Options'
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
  const [modules, setModules] = useState([]);
  const [isIndependent, setIsIndependent] = useState(false);

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
        setError(err.response?.data?.message || 'Failed to load lesson');
        toast.error(err.response?.data?.message || 'Failed to load lesson');
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

      const response = await api.put(`/lessons/${lessonId}`, payload);
      
      setLesson(response.data.data);
      setError('');
      toast.success('Lesson updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lesson');
      toast.error(err.response?.data?.message || 'Failed to update lesson');
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
      toast.success('Lesson published successfully!');
      navigate('/instructor/lessons');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish lesson');
      toast.error(err.response?.data?.message || 'Failed to publish lesson');
    } finally {
      setIsPublishing(false);
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

  if (loading) return <LoadingSpinner fullScreen={true} />;
  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editing: {lesson.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Status: {lesson.isPublished ? (
            <span className="text-green-600">Published</span>
          ) : (
            <span className="text-yellow-600">Draft</span>
          )}
          {lesson.moduleId && (
            <span className="ml-4">Module: {lesson.module?.title}</span>
          )}
        </p>
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
              Back
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleUpdate(lesson)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}