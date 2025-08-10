import ContentTypeBadge from './ContentTypeBadge';
import { FiDownload, FiEye, FiMoreVertical } from 'react-icons/fi';
import Dropdown from '@/components/common/Dropdown';
import Avatar from '@/components/common/Avatar';

export default function ContentCard({ 
  content, 
  onPreview, 
  onEdit, 
  onDelete,
  canEdit 
}) {
  const dropdownItems = [
    { label: 'Preview', action: () => onPreview(content) },
    canEdit && { label: 'Edit', action: () => onEdit(content) },
    canEdit && { label: 'Delete', action: () => onDelete(content.contentId), danger: true }
  ].filter(Boolean);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center cursor-pointer"
        onClick={() => onPreview(content)}
      >
        {content.fileType === 'image' ? (
          <img 
            src={content.fileUrl} 
            alt={content.title}
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="text-4xl text-gray-400">
            {content.fileType === 'pdf' ? '📄' : 
             content.fileType === 'video' ? '🎬' : 
             content.fileType === 'link' ? '🔗' : '📂'}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate">{content.title}</h3>
          {dropdownItems.length > 0 && (
            <Dropdown
              trigger={
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiMoreVertical />
                </button>
              }
              items={dropdownItems}
              align="right"
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <ContentTypeBadge type={content.fileType} />
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiDownload className="mr-1" />
            {content.downloadCount || 0}
          </div>
        </div>
        
        <div className="flex items-center mt-3 text-sm">
          <Avatar 
            src={content.uploader?.avatarUrl} 
            alt={content.uploader?.username} 
            size="xs" 
            className="mr-2"
          />
          <span className="truncate">{content.uploader?.username}</span>
        </div>
      </div>
    </div>
  );
}