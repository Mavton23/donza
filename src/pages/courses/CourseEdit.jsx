import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CourseForm from '@/components/courses/CourseForm';
import ModuleManager from '@/components/courses/ModuleManager';
import PublishPanel from '@/components/courses/PublishPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function CourseEdit() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formStep, setFormStep] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/course/${courseId}`);
        setCourse(response.data.data.course);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleUpdate = async (updatedData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.put(`/courses/${courseId}`, formData);

      setCourse(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.put(`/courses/${courseId}`, {
        status: 'published',
        isPublic: true
      });
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen={true} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editing: {course?.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Status: <span className="capitalize">{course?.status}</span>
        </p>
      </div>

      {error && (
        toast.error(error)
      )}

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('details')}
        >
          Course Details
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'content' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'publish' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('publish')}
        >
          Publish
        </button>
      </div>

      {activeTab === 'details' && (
        <div>
          <CourseForm 
            step={formStep}
            courseData={course} 
            setCourseData={setCourse}
            onSubmit={handleUpdate} 
            isEditMode={true}
          />
          <div className="flex justify-between mb-6 p-4">
            <button
                onClick={() => setFormStep(prev => Math.max(prev - 1, 0))}
                disabled={formStep === 0}
                className={`px-4 py-2 rounded-md ${formStep === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
            >
                Previous
            </button>
            <button
                onClick={() => formStep < 2 ? setFormStep(prev => prev + 1) : handleUpdate(course)}
                className={`px-4 py-2 rounded-md ${formStep < 2 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}
            >
                {formStep < 2 ? 'Next' : 'Save Changes'}
            </button>
            </div>
        </div>
      )}

      {activeTab === 'content' && (
        <ModuleManager 
          courseId={courseId} 
          modules={course.modules || []} 
          onUpdate={setCourse}
        />
      )}

      {activeTab === 'publish' && (
        <PublishPanel 
          course={course}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}
    </div>
  );
}