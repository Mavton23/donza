import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CourseHeader from '@/components/courses/CourseHeader';
import CourseTabs from '@/components/courses/CourseTabs';
import Reviews from '../Review';
import ModuleList from '@/components/courses/ModuleList';
import CourseSidebar from '@/components/courses/CourseSidebar';
import EnrollmentButton from '@/components/courses/EnrollmentButton';

export default function CourseDetail() {
  usePageTitle();
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${slug}`);
        const courseData = response.data.data;
        
        // Verifica se o usuário está matriculado
        const userIsEnrolled = user && courseData.enrollmentIds 
          ? courseData.enrollmentIds.includes(user.userId)
          : false;
        
        const userIsOrganizer = user && courseData.instructor 
          ? user.userId === courseData.instructor.userId
          : false;
        
        setCourse(courseData);
        setIsEnrolled(userIsEnrolled);
        setIsOrganizer(userIsOrganizer);
      } catch (err) {
        setError('Failed to load course details');
        console.log("MOTIVO: ", err instanceof Error ? err.message : err);
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, navigate, user]);

  const handleEnrollmentChange = (enrolled) => {
    setIsEnrolled(enrolled);
    
    if (enrolled && user) {
      setCourse(prev => ({
        ...prev,
        enrollmentIds: [...(prev.enrollmentIds || []), user.userId]
      }));
    }
  };

  if (loading || !course) return <LoadingSpinner fullScreen />;

  // Determina se o usuário pode ver/interagir com avaliações
  const canAccessReviews = isEnrolled || isOrganizer;
  const canCreateReview = isEnrolled;
  const canReplyToReviews = isOrganizer;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <CourseHeader 
        course={course} 
        isEnrolled={isEnrolled}
        isOrganizer={isOrganizer}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:flex-1">
            <CourseTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isEnrolled={isEnrolled}
              isOrganizer={isOrganizer}
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {activeTab === 'content' && (
              <ModuleList 
                courseId={course.courseId} 
                isEnrolled={isEnrolled}
                isOrganizer={isOrganizer}
              />
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Avaliações do Curso
                  </h3>
                  {canCreateReview && (
                    <Link 
                      to={`/courses/${course.courseId}/reviews`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Escrever Avaliação
                    </Link>
                  )}
                </div>
                
                <Reviews 
                  entityId={course.courseId}
                  entityType="course"
                  canReview={canCreateReview}
                  canReply={canReplyToReviews}
                  isOrganizer={isOrganizer}
                />
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={course.instructor?.avatarUrl || '/images/placeholder.png'}
                    alt={course.instructor?.username}
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {course.instructor?.username}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {course.instructor?.bio || 'No bio available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            <CourseSidebar 
              course={course} 
              isEnrolled={isEnrolled}
              isOrganizer={isOrganizer}
            />
            
            <EnrollmentButton
              slug={course.slug}
              courseId={course.courseId}
              price={course.price}
              isEnrolled={isEnrolled}
              onEnrollmentChange={handleEnrollmentChange}
              isOrganizer={isOrganizer}
            />

            {isOrganizer && (
              <Link
                to={`/instructor/courses/${course.courseId}/edit`}
                className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Edit Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}