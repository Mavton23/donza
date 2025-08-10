import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function CourseSidebar({ course }) {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLessonSelect = (moduleId, lessonId) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate(`content/${moduleId}/${lessonId}`, {
      replace: true
    }).finally(() => setIsNavigating(false));
  };

  if (!course?.modules) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No modules available</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">Course Content</h3>
      <div className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.moduleId} className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {module.title}
            </h4>
            <ul className="mt-2 space-y-1">
              {module.lessons?.map((lesson) => (
                <li key={lesson.lessonId}>
                  <button
                    onClick={() => handleLessonSelect(module.moduleId, lesson.lessonId)}
                    disabled={isNavigating}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      lessonId === lesson.lessonId
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}