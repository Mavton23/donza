import EmptyState from '@/components/common/EmptyState';
import ErrorAlert from '@/components/common/ErrorAlert';
import Pagination from '@/components/common/Pagination';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewFilters from '@/components/reviews/ReviewFilters';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewGuidelines from './ReviewGuidelines';

export default function StudentReviewView({
  entityType,
  reviews,
  summary,
  pagination,
  filters,
  canReview,
  showForm,
  error,
  onFilterChange,
  onPageChange,
  onReviewSubmit,
  onToggleForm,
  onErrorDismiss
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {entityType === 'event' ? 'Avaliações do Evento' : 'Avaliações do Curso'}
          </h1>
          {canReview && !showForm && (
            <button
              onClick={onToggleForm}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Escrever Avaliação
            </button>
          )}
        </div>

        {showForm && (
          <ReviewForm 
            onSubmit={onReviewSubmit}
            onCancel={onToggleForm}
          />
        )}

        {error && (
          <ErrorAlert 
            message={error}
            onDismiss={onErrorDismiss}
          />
        )}

        <ReviewFilters 
          filters={filters}
          onChange={onFilterChange}
        />

        {reviews.length === 0 ? (
          <EmptyState
            title="Nenhuma avaliação encontrada"
            description="Nenhuma avaliação corresponde aos filtros atuais."
            action={
              <button
                onClick={() => onFilterChange({
                  sort: 'recent',
                  rating: 'all',
                  hasComment: false
                })}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Limpar Filtros
              </button>
            }
          />
        ) : (
          <>
            <ReviewList reviews={reviews} />
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
        />
        <ReviewGuidelines />
      </div>
    </div>
  );
}