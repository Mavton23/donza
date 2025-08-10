import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useCourse(slug) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/courses/${slug}`);
        
        const courseData = response.data.data;
        
        if (!courseData) {
          throw new Error('Course data not found in response');
        }

        const shouldSortModules = !courseData.modules.every(
          (module, index, arr) => index === 0 || module.order >= arr[index-1].order
        );

        const shouldSortLessons = courseData.modules.some(
          module => module.lessons && !module.lessons.every(
            (lesson, index, arr) => index === 0 || lesson.order >= arr[index-1].order
          )
        );

        const processedCourse = {
          ...courseData,
          modules: [...(courseData.modules || [])]
        };

        if (shouldSortModules) {
          processedCourse.modules.sort((a, b) => a.order - b.order);
        }

        if (shouldSortLessons) {
          processedCourse.modules.forEach(module => {
            if (module.lessons) {
              module.lessons.sort((a, b) => a.order - b.order);
            }
          });
        }

        if (!processedCourse.metrics?.lessonsCount) {
          processedCourse.metrics = {
            ...processedCourse.metrics,
            lessonsCount: processedCourse.modules.reduce(
              (sum, module) => sum + (module.lessons?.length || 0), 0
            ),
            modulesCount: processedCourse.modules.length
          };
        }

        setCourse(processedCourse);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  return { course, loading, error };
}