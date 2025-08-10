import { Link } from 'react-router-dom';

export default function PersonalizedRecommendations({ recommendations, role }) {
  if (recommendations.length === 0) return null;

  const title = role === 'student' 
    ? 'Recommended For You' 
    : 'Teaching Recommendations';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <div className="space-y-4">
          {recommendations.slice(0, 3).map((rec, index) => (
            <Link
              key={index}
              to={rec.link}
              className="block group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-gray-700 rounded-lg p-2 text-indigo-600 dark:text-indigo-400">
                  {rec.icon}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {rec.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {rec.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}