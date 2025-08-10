import { useState } from 'react';
import { useCourseReviews } from '@/hooks/useCourseReviews';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import InstructorReviewTools from '@/components/reviews/InstructorReviewTools';

export default function InstructorCourseReviews({ courseId }) {
  const [filters, setFilters] = useState({
    sort: 'recent',
    rating: 'all',
    hasComment: false
  });

  const { 
    reviews, 
    summary, 
    isLoading, 
    error,
    refetch
  } = useCourseReviews(courseId, filters);

  const handleReplySuccess = () => {
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Course Reviews</h1>
            <InstructorReviewTools courseId={courseId} />
          </div>

          {error && (
            <div className="alert-error">{error}</div>
          )}

          <ReviewFilters 
            filters={filters}
            onChange={setFilters}
            showAdvanced={true}
          />

          <ReviewList 
            reviews={reviews}
            onReplySuccess={handleReplySuccess}
            isInstructor={true}
          />
        </div>

        <div className="lg:w-80 space-y-6">
          <ReviewSummary 
            data={summary} 
            showInstructorStats={true}
          />
        </div>
      </div>
    </div>
  );
}