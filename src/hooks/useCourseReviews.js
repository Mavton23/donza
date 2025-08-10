import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useCourseReviews(courseId, filters) {
  return useQuery({
    queryKey: ['course-reviews', courseId, filters],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/courses/${courseId}/reviews`, {
        params: filters
      });
      return data;
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}