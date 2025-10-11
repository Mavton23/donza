import usePageTitle from "@/hooks/usePageTitle";
import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import ReviewAnalytics from '@/components/reviews/ReviewAnalytics';
import ReviewList from '@/components/reviews/ReviewList';
import InstitutionReviewFilters from '@/components/reviews/InstitutionReviewFilters';
import Pagination from '@/components/common/Pagination';

export default function InstitutionReviewsDashboard() {
  usePageTitle();
  const [filters, setFilters] = useState({
    dateRange: null,
    minRating: null,
    courseId: null,
    instructorId: null,
    status: 'all',
    page: 1,
    limit: 10
  });

  const { data, isLoading, error, refetch } = useQuery(
    ['institution-reviews', filters],
    async () => {
      const params = {
        ...filters,
        startDate: filters.dateRange?.startDate,
        endDate: filters.dateRange?.endDate
      };
      
      const { data } = await api.get('/institution/reviews', { params });
      return data;
    },
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5
    }
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Review Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor all reviews across your institution
        </p>
      </div>

      {error && (
        <ErrorAlert 
          message={error.response?.data?.message || 'Failed to load reviews'}
          onRetry={refetch}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <InstitutionReviewFilters
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-6">
          <ReviewAnalytics 
            data={data?.analytics} 
            loading={isLoading}
          />

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">
                Recent Reviews
                {data?.totalCount && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({data.totalCount} total)
                  </span>
                )}
              </h2>
            </div>

            {data?.reviews?.length > 0 ? (
              <>
                <ReviewList 
                  reviews={data.reviews} 
                  showCourseInfo={true}
                  showInstructorInfo={true}
                />
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No reviews match your current filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}