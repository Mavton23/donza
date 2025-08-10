import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useCanReview(entityType, courseId) {
  return useQuery({
    queryKey: ['can-review', entityType, courseId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${entityType}/${courseId}/can-review`);
      return data;
    },
    enabled: !!courseId,
    select: (data) => data?.canReview
  });
}
