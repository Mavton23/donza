import { useEffect, useRef } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import useCourse from '@/hooks/useCourse';
import useEnrollmentStatus from '@/hooks/useEnrollmentStatus';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotEnrolledRedirect from '@/components/common/NotEnrolledRedirect';
import CourseLayout from './CourseLayout';

export default function CourseLearningPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { course, loading: courseLoading, error: courseError } = useCourse(slug);
  const { isEnrolled, loading: enrollmentLoading, error: enrollmentError } = useEnrollmentStatus(course?.courseId);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || !isEnrolled || !course) return;
    
    if (course.modules?.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule.lessons?.length > 0) {
        hasRedirected.current = true;
        const firstLesson = firstModule.lessons[0];
        navigate(`content/${firstModule.moduleId}/${firstLesson.lessonId}`, { 
          replace: true,
          state: { fromRedirect: true }
        });
      }
    }
  }, [course, isEnrolled, navigate]);

  if (courseLoading || enrollmentLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (courseError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-4 text-red-500">Error loading course</h2>
          <p className="text-gray-600 dark:text-gray-300">{courseError}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-4">Course not found</h2>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    console.log("USUARIO NAO MATRICULADO!")
    return <NotEnrolledRedirect slug={slug} />;
  }

  return (
    <CourseLayout course={course}>
      <Outlet />
    </CourseLayout>
  );
}