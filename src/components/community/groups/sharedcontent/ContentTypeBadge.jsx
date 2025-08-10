import { FiFile, FiImage, FiVideo, FiLink, FiCode } from 'react-icons/fi';

const typeIcons = {
  pdf: <FiFile className="text-red-500" />,
  image: <FiImage className="text-blue-500" />,
  video: <FiVideo className="text-purple-500" />,
  link: <FiLink className="text-green-500" />,
  code: <FiCode className="text-gray-500" />,
  default: <FiFile className="text-yellow-500" />
};

export default function ContentTypeBadge({ type }) {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700">
      {typeIcons[type] || typeIcons.default}
      <span className="ml-1 capitalize">{type}</span>
    </div>
  );
}