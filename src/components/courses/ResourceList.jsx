import { Download, FileText, Video, Link as LinkIcon } from 'lucide-react';

export default function ResourceList({ resources, courseId }) {
  const getIcon = (type) => {
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

  if (!resources || resources.length === 0) return null;

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Lesson Resources
      </h4>
      <ul className="space-y-2">
        {resources.map((resource, index) => (
          <li key={index}>
            <a
              href={`/api/courses/${courseId}/resources/${resource.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {getIcon(resource.type)}
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {resource.name}
              </span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {resource.size}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}