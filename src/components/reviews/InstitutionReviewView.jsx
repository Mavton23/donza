import Pagination from '@/components/common/Pagination';
import InstitutionReviewDashboard from '@/components/reviews/InstitutionReviewDashboard';

export default function InstitutionReviewView({
    reviews,
    filters,
    error,
    onFilterChange,
    onPageChange
  }) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Painel de Avaliações
        </h1>
  
        {error && <ErrorAlert message={error} />}
  
        <InstitutionReviewDashboard 
          filters={filters}
          onFilterChange={onFilterChange}
          data={reviews}
        />
  
        {reviews.length > 0 && (
          <div className="mt-6">
            <Pagination {...pagination} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    );
  }