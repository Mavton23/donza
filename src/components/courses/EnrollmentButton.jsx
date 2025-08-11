import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentButton({ 
  slug,
  courseId, 
  price, 
  onEnrollmentChange,
  isOrganizer 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/courses/${courseId}/enroll/${user.userId}`);
        setIsEnrolled(response.data.isEnrolled);
        setEnrollmentData(response.data.enrollment);
      } catch (err) {
        console.error('Error checking enrollment:', err);
      }
    };

    checkEnrollmentStatus();
  }, [courseId, user]);

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }
  
    try {
      setLoading(true);
  
      if (isEnrolled) {
        // Caso já matriculado: vai direto para o player
        navigate(`/learn/${slug}`, {
          state: { 
            courseId: courseId
          }
        });
      } else {
        // Nova matrícula
        const response = await api.post(`/courses/${courseId}/enroll`, { courseId });
        setIsEnrolled(true);
        setEnrollmentData(response.data);
        onEnrollmentChange?.(true);
        
        // Redireciona para a rota padronizada
        navigate(`/learn/${slug}`, {
          state: { 
            newlyEnrolled: true,
            lastAccessed: response.data.lastAccessedLesson,
            courseId: courseId
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro na matrícula');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Se for o organizador, não mostra botão, apenas a info */}
      {isOrganizer ? (
        <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 px-4 py-2 rounded text-center font-medium">
          Você é o organizador deste curso
        </div>
      ) : (
        <>
          <button
            onClick={handleEnrollment}
            disabled={loading || !user}
            className={`w-full px-4 py-3 rounded-md font-medium text-center ${
              isEnrolled
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                : price > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? (
              'Processing...'
            ) : !user ? (
              'Login to Enroll'
            ) : isEnrolled ? (
              enrollmentData?.status === 'completed'
                ? 'Course Completed - View Certificate'
                : 'Enrolled - Access Course'
            ) : Number(price) > 0 ? (
              `Enroll Now - $${Number(price).toFixed(2)}`
            ) : (
              'Enroll for Free'
            )}
          </button>

          {isEnrolled && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {enrollmentData?.progress > 0 && (
                <p>Progress: {enrollmentData.progress}%</p>
              )}
              {enrollmentData?.status === 'completed' && (
                <p className="text-green-600 dark:text-green-400">Course completed!</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
