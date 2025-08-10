import EmptyState from '@/components/common/EmptyState';
import ErrorAlert from '@/components/common/ErrorAlert';
import Pagination from '@/components/common/Pagination';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import InstructorReviewTools from '@/components/reviews/InstructorReviewTools';
import ReviewGuidelines from './ReviewGuidelines';

export default function InstructorReviewView({
    entityType,
    entityId,
    reviews,
    summary,
    pagination,
    filters,
    replyingTo,
    error,
    onFilterChange,
    onPageChange,
    onReplyStart,
    onReplySubmit,
    onErrorDismiss
  }) {

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {entityType === 'event' ? 'Avaliações do Evento' : 'Avaliações do Curso'}
            </h1>
            <InstructorReviewTools 
              courseId={entityType === 'course' ? entityId : null}
            />
          </div>
  
          {error && (
            <ErrorAlert 
            message={error}
            onDismiss={() => {onErrorDismiss}}
            />
          )}
  
          <ReviewFilters 
            filters={filters}
            onChange={onFilterChange}
            showAdvanced={true}
          />
  
          {reviews.length === 0 ? (
            <EmptyState
              title="Nenhuma avaliação encontrada"
              description="Nenhuma avaliação corresponde aos filtros atuais."
            />
          ) : (
            <>
              <ReviewList 
                reviews={reviews}
                showReplyForm={replyingTo}
                onReplyStart={onReplyStart}
                onReplySubmit={onReplySubmit}
                isInstructor={true}
              />
              {pagination.totalPages > 1 && (
                <Pagination {...pagination} onPageChange={onPageChange} />
              )}
            </>
          )}
        </div>
  
        <div className="lg:w-80">
          <ReviewSummary 
            summary={summary}
            totalReviews={pagination.totalItems}
            showInstructorStats={true}
          />
          <ReviewGuidelines isInstructor={true} />
        </div>
      </div>
    );
  }