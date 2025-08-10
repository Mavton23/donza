import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StudentCourseReviews from './StudentCourseReviews';
import InstructorCourseReviews from './InstructorCourseReviews';
import Unauthorized from '@/components/common/Unauthorized';
 
export default function CourseReviews() {
  const { courseId } = useParams();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return <LoadingSpinner />;
  
  if (!courseId) {
    return <div className="p-4 text-red-500">Course ID is required</div>;
  }

  switch (user?.role) {
    case 'student':
      return <StudentCourseReviews courseId={courseId} />;
    case 'instructor':
      return <InstructorCourseReviews courseId={courseId} />;
    default:
      return <Unauthorized />;
  }
}