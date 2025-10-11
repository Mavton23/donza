import usePageTitle from "@/hooks/usePageTitle";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function Reviews({ entityId, entityType, canReview, isOrganizer }) {
  usePageTitle();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', entityId],
    queryFn: () => api.get(`/reviews/${entityType}/${entityId}/reviews`).then(res => res.data),
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5,
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => 
      api.put(`/reviews/reviews/${reviewId}/reply`, { reply }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['reviews', entityId], (oldData) => {
        return {
          ...oldData,
          reviews: oldData.reviews.map(review => 
            review.reviewId === variables.reviewId 
              ? { 
                  ...review, 
                  instructorReply: variables.reply,
                  replyDate: new Date().toISOString() 
                } 
              : review
          )
        };
      });
      setReplyingTo(null);
    },
    onError: (error) => {
      console.error('Error submitting reply:', error);
      queryClient.invalidateQueries(['reviews', entityId]);
    }
  });

  const handleReplySubmit = (reviewId, reply) => {
    replyMutation.mutate({ reviewId, reply });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorAlert message={error.message} />;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:flex-1">
        <ReviewList 
          reviews={data?.reviews || []} 
          canReview={canReview}
          entityId={entityId}
          entityType={entityType}
          isInstructor={isOrganizer}
          showReplyForm={replyingTo}
          onReplyStart={setReplyingTo}
          onReplySubmit={handleReplySubmit}
          isSubmittingReply={replyMutation.isLoading} 
        />
      </div>
      <div className="lg:w-80">
        <ReviewSummary 
          averageRating={data?.averageRating}
          totalReviews={data?.totalReviews}
          ratingDistribution={data?.ratingDistribution}
        />
      </div>
    </div>
  );
}