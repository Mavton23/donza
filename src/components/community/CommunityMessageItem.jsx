import { forwardRef, useEffect, useRef } from 'react';
import Avatar from '@/components/common/Avatar';
import TimeAgo from '@/components/common/TimeAgo';
import { FiEdit2, FiTrash2, FiMoreVertical, FiCheck } from 'react-icons/fi';
import Dropdown from '@/components/common/Dropdown';

const CommunityMessageItem = forwardRef(({ 
  message, 
  currentUserId,
  onEdit, 
  onDelete,
  onRead,
  showHeader = true,
  isCompact = false,
  onSizeMeasured
}, ref) => {
  const containerRef = useRef();
  const isCurrentUser = message.senderId === currentUserId;

  const dropdownItems = [
    { label: 'Editar', icon: <FiEdit2 />, action: () => onEdit(message.messageId, message.content), show: isCurrentUser },
    { label: 'Excluir', icon: <FiTrash2 />, action: () => onDelete(message.messageId), show: isCurrentUser, danger: true }
  ].filter(item => item.show);

  useEffect(() => {
    if (containerRef.current && onSizeMeasured) {
      const height = containerRef.current.getBoundingClientRect().height;
      onSizeMeasured(height);
      
      // Verifica se a mensagem não foi lida pelo usuário atual (readBy é um objeto)
      if (message.readBy && !message.readBy[currentUserId]) {
        onRead?.(message.messageId);
      }
    }
  }, [message, onSizeMeasured, onRead, currentUserId]);

  return (
    <div 
      ref={containerRef}
      className={`group relative flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1 px-2 ${
        isCompact ? 'mt-0' : 'mt-2'
      }`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-2 self-end">
          {showHeader ? (
            <Avatar 
              src={message.sender.avatarUrl} 
              alt={message.sender.username} 
              size="sm"
              className="mb-1"
            />
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {showHeader && !isCurrentUser && (
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
            {message.sender.username}
            {message.sender.role === 'instructor' && (
              <span className="ml-1 text-xs text-indigo-600 dark:text-indigo-400">(Instrutor)</span>
            )}
          </div>
        )}

        <div 
          className={`relative rounded-lg px-3 py-2 max-w-[80%] ${
            isCurrentUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'
          } ${
            isCompact ? 'mt-0' : 'mt-1'
          }`}
        >
          {message.content}
          
          {message.metadata?.file && (
            <div className="mt-2">
              {message.metadata.file.type?.startsWith('image/') ? (
                <img 
                  src={message.metadata.file.url} 
                  alt="Attachment" 
                  className="max-h-40 rounded-md"
                  onLoad={() => {
                    if (containerRef.current && onSizeMeasured) {
                      onSizeMeasured(containerRef.current.getBoundingClientRect().height);
                    }
                  }}
                />
              ) : (
                <a 
                  href={message.metadata.file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-400 hover:underline"
                >
                  📎 {message.metadata.file.name}
                </a>
              )}
            </div>
          )}

          <div className={`flex items-center justify-end mt-1 space-x-1 ${
            isCurrentUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.edited && (
              <span className="text-xs italic mr-1">editado</span>
            )}
            <TimeAgo 
              date={message.createdAt} 
              className="text-xs"
            />
            {isCurrentUser && (
              <FiCheck 
                size={14} 
                className={`ml-1 ${
                  message.readBy && Object.keys(message.readBy).length > 0 
                    ? 'text-blue-300' 
                    : 'text-gray-400'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {dropdownItems.length > 0 && (
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity ${
          isCurrentUser ? 'right-0' : 'left-0'
        }`}>
          <Dropdown
            trigger={
              <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FiMoreVertical size={16} />
              </button>
            }
            items={dropdownItems}
            align={isCurrentUser ? 'left' : 'right'}
          />
        </div>
      )}
    </div>
  );
});

CommunityMessageItem.displayName = 'CommunityMessageItem';
export default CommunityMessageItem;