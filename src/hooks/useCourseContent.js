import { useState } from 'react';

export default function useCourseContent(course) {
  const [activeLesson, setActiveLesson] = useState(null);

  const findFirstLesson = () => {
    if (!course?.modules) return null;
    for (const module of course.modules) {
      if (module.lessons?.length > 0) {
        return module.lessons[0].lessonId;
      }
    }
    return null;
  };

  const initializeLesson = () => {
    if (!activeLesson && course) {
      setActiveLesson(findFirstLesson());
    }
  };

  return { activeLesson, setActiveLesson, initializeLesson };
}