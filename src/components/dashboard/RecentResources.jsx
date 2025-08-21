import { Download, FileText, Video, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const getResourceIcon = (type) => {
  switch (type) {
    case 'document':
      return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'video':
      return <Video className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    case 'link':
      return <LinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    default:
      return <Download className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  }
};

export default function RecentResources({ resources }) {
  if (resources.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recursos recentes
        </h2>
        <ul className="space-y-3">
          {resources.map((resource, index) => (
            <li key={index}>
              <Link
                to={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {getResourceIcon(resource.type)}
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {resource.name}
                </span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {resource.course}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-center">
          <Link
            to="/resources"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            Ver todos recursos
          </Link>
        </div>
      </div>
    </div>
  );
}