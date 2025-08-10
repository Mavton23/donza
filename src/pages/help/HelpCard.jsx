import { Link } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';

const HelpCard = ({ article, showCategory = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <Link to={`/help/article/${article.slug}`} className="block">
        {showCategory && (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full mb-3">
            {article.category}
          </span>
        )}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
            Ler mais
            <ChevronRight size={16} className="ml-1" />
          </div>
          {article.rating && (
            <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <Star size={14} className="mr-1 fill-current" />
              {article.rating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default HelpCard;