import Rating from './Rating';

export default function ReviewSummary({ summary, totalReviews = 0, showInstructorStats = false }) {
  const safeSummary = summary || {
    averageRating: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    responseRate: 0,
    averageResponseTime: 0
  };

  const averageRating = safeSummary.averageRating?.toFixed(1) || '0.0';
  const ratingCounts = safeSummary.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Resumo das Avaliações
      </h3>
      
      <div className="flex items-center mb-4">
        <div className="text-3xl font-bold mr-4">
          {averageRating}
        </div>
        <div>
          <Rating value={safeSummary.averageRating || 0} size="lg" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = ratingCounts[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center">
              <div className="w-8 text-sm">{rating} estrela{rating !== 1 && 's'}</div>
              <div className="flex-1 mx-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-8 text-sm text-right">
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {showInstructorStats && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2">Estatísticas do Instrutor</h4>
          <div className="flex justify-between text-sm">
            <span>Taxa de Resposta:</span>
            <span>{(safeSummary.responseRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tempo Médio de Resposta:</span>
            <span>{safeSummary.averageResponseTime} dia{safeSummary.averageResponseTime !== 1 && 's'}</span>
          </div>
        </div>
      )}
    </div>
  );
}