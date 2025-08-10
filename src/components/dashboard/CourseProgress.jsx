import ProgressBar from '../common/ProgressBar';
import { Link } from 'react-router-dom';

export default function CourseProgress({ courses, recommendations }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Course Progress
          </h2>
          <Link
            to="/my-courses"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            View All
          </Link>
        </div>

        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.courseId}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {course.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
              </div>
              <ProgressBar 
                value={(course.completedLessons / course.totalLessons) * 100} 
                height={3}
                className="mt-1"
              />
            </div>
          ))}
        </div>

        {recommendations.courses?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Recommended Courses
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {recommendations.courses.slice(0, 2).map((course) => (
                <Link
                  key={course.courseId}
                  to={`/courses/${course.slug}`}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={course.coverUrl || '/course-placeholder.jpg'}
                    alt={course.title}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.instructor.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}