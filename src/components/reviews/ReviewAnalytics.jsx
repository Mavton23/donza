export default function ReviewAnalytics({ data, loading }) {
    const stats = [
      { name: 'Total Reviews', value: data?.totalReviews || 0 },
      { name: 'Average Rating', value: data?.averageRating?.toFixed(1) || '0.0' },
      { name: 'Response Rate', value: data?.responseRate ? `${data.responseRate}%` : '0%' },
      { name: 'Courses Reviewed', value: data?.coursesReviewed || 0 }
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.name}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.name}
            </h3>
            <p className="mt-1 text-2xl font-semibold">
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>
    );
  }