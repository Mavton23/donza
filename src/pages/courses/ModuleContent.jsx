import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LessonContent from '../../components/courses/LessonViewer';
import LessonNavigation from '../../components/courses/LessonNavigation';
import CourseProgress from '../../components/courses/CourseProgress';
import CompleteLessonButton from '../../components/courses/CompleteLessonButton';
import ResourceList from '../../components/courses/ResourceList';

export default function ModuleContent() {
  const { slug, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const courseRes = await api.get(`/courses/${slug}`);
        setCourse(courseRes.data);

        const currentModule = courseRes.data.modules.find(m => 
          m.lessons.some(l => l.lessonId === lessonId)
        );
        
        if (!currentModule) {
          throw new Error('Module not found');
        }

        setModule(currentModule);

        const currentLesson = currentModule.lessons.find(l => l.lessonId === lessonId);
        setLesson(currentLesson);

        if (user) {
          const enrollmentRes = await api.get(`/users/${user.userId}/enrollment/${courseRes.data.courseId}`);
          setProgress(enrollmentRes.data.progress);
          setIsCompleted(enrollmentRes.data.completedLessons.includes(lessonId));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lesson');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, lessonId, user]);

  const handleLessonComplete = async () => {
    if (!user) return;

    try {
      await api.post(`/users/${user.userId}/complete-lesson`, {
        courseId: course.courseId,
        lessonId
      });
      setIsCompleted(true);
      
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const newProgress = ((progress * totalLessons + 1) / totalLessons) * 100;
      setProgress(newProgress);
    } catch (err) {
      setError('Failed to mark lesson as complete');
    }
  };

  const handleNavigateLesson = (newLessonId) => {
    navigate(`/courses/${slug}/lessons/${newLessonId}`);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course || !module || !lesson) return <div>Lesson not found</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {module.title}
                    </h2>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {lesson.title}
                    </h1>
                  </div>
                  {user && (
                    <CourseProgress 
                      value={progress} 
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-6 mt-4 rounded">
                  {error}
                </div>
              )}

              <LessonContent 
                content={lesson.content} 
                contentType={lesson.type}
              />

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <ResourceList 
                  resources={lesson.resources} 
                  courseId={course.courseId}
                />
              </div>

              {user && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  <CompleteLessonButton
                    isCompleted={isCompleted}
                    onComplete={handleLessonComplete}
                  />
                </div>
              )}
            </div>

            <LessonNavigation
              module={module}
              currentLessonId={lessonId}
              onNavigate={handleNavigateLesson}
              courseSlug={slug}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Course Content
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {course.modules.map((mod) => (
                    <div key={mod.moduleId}>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {mod.title}
                      </h4>
                      <ul className="mt-1 space-y-1">
                        {mod.lessons.map((les) => (
                          <li key={les.lessonId}>
                            <Link
                              to={`/courses/${slug}/lessons/${les.lessonId}`}
                              className={`flex items-center text-sm ${
                                les.lessonId === lessonId
                                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                              }`}
                            >
                              {les.lessonId === lessonId ? (
                                <span className="mr-2">▶</span>
                              ) : (
                                <span className="mr-2">○</span>
                              )}
                              {les.title}
                              {user?.completedLessons?.includes(les.lessonId) && (
                                <span className="ml-auto text-green-500">✓</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}