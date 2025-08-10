import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LessonNavigation({ course, currentLesson }) {
  const { prevLesson, nextLesson } = findAdjacentLessons(course, currentLesson?.lessonId);

  return (
    <div className="flex justify-between mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
      {prevLesson ? (
        <Link
          to={`/learn/${course.slug}/lesson/${prevLesson.lessonId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous: {prevLesson.title}
        </Link>
      ) : (
        <div></div>
      )}
      
      {nextLesson ? (
        <Link
          to={`/learn/${course.slug}/lesson/${nextLesson.lessonId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next: {nextLesson.title}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}

function findAdjacentLessons(course, lessonId) {
  let prevLesson = null;
  let nextLesson = null;
  let found = false;

  for (const module of course.modules || []) {
    for (let i = 0; i < module.lessons.length; i++) {
      if (module.lessons[i].lessonId === lessonId) {
        found = true;
        
        // Previous lesson
        if (i > 0) {
          prevLesson = module.lessons[i - 1];
        } else {
          // Check previous module
          const moduleIndex = course.modules.indexOf(module);
          if (moduleIndex > 0) {
            const prevModule = course.modules[moduleIndex - 1];
            if (prevModule.lessons.length > 0) {
              prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
            }
          }
        }
        
        // Next lesson
        if (i < module.lessons.length - 1) {
          nextLesson = module.lessons[i + 1];
        } else {
          // Check next module
          const moduleIndex = course.modules.indexOf(module);
          if (moduleIndex < course.modules.length - 1) {
            const nextModule = course.modules[moduleIndex + 1];
            if (nextModule.lessons.length > 0) {
              nextLesson = nextModule.lessons[0];
            }
          }
        }
        
        break;
      }
    }
    if (found) break;
  }

  return { prevLesson, nextLesson };
}