import { useState } from 'react';
import api from '../../services/api';
import { useCourseReviews } from '@/hooks/useCourseReviews';
import { useCanReview } from '@/hooks/useCanReview';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function StudentCourseReviews({ courseId }) {
  const [showForm, setShowForm] = useState(false);
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

  const { data: canReview } = useCanReview('course', courseId);

  const handleSubmitSuccess = () => {
    setShowForm(false);
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
            {canReview ? (
              !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Write a Review
                </button>
              )
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span>Review eligibility requirements not met</span>
              </div>
            )}
          </div>

          {/* Eligibility Requirements Card */}
          {!canReview && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5" />
                Why can't I review this course?
              </h3>
              <ul className="mt-2 text-yellow-700 dark:text-yellow-300 text-sm list-disc list-inside space-y-1">
                {/* {!isEnrolled && ( */}
                  <li>You must be enrolled in the course</li>
                {/* )} */}
                {/* {!hasCompleted && ( */}
                  <li>You need to complete the course first</li>
                {/* )} */}
                {/* {hasReviewed && ( */}
                  <li>You've already submitted a review</li>
                {/* )} */}
              </ul>
            </div>
          )}

          {showForm && (
            <ReviewForm 
              entityName={courseId}
              onSubmit={(formData) => {
                api.post(`/reviews/courses/${courseId}/reviews`, formData)
                  .then(() => {
                    handleSubmitSuccess();
                  })
                  .catch(error => {
                    console.error("Review submission failed:", error);
                  });
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          <ReviewFilters 
            filters={filters}
            onChange={setFilters}
          />

          {error && (
            <div className="alert-error">{error}</div>
          )}

          {reviews?.length === 0 ? (
            <EmptyState
              title={canReview ? "No reviews yet" : "Course Reviews"}
              description={
                canReview 
                  ? "Be the first to review this course" 
                  : "Reviews will appear here once students complete the course"
              }
            />
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>

        <div className="lg:w-80 space-y-6">
          <ReviewSummary data={summary} />
          
          {/* Additional Status Card */}
          {canReview && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                {canReview ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span>You can review this course</span>
                  </>
                ) : (
                  <>
                    <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
                    <span>Review Status</span>
                  </>
                )}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {canReview
                  ? "Share your experience to help other students"
                  : "Complete all course requirements to submit your review"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}