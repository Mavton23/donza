import { FiMessageSquare, FiUser, FiPin } from 'react-icons/fi';
import Avatar from '@/components/common/Avatar';
import TimeAgo from '@/components/common/TimeAgo';

export default function TopicItem({ topic, onClick }) {
  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between">
        <h3 className="font-medium flex items-center gap-2">
          {topic.isPinned && <FiPin className="text-yellow-500" />}
          {topic.title}
          {topic.solutionId && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              Resolvido
            </span>
          )}
        </h3>
        <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <FiMessageSquare className="mr-1" />
          {topic.replyCount}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mt-3 text-sm">
        <Avatar src={topic.author.avatarUrl} alt={topic.author.username} size="xs" />
        <span>{topic.author.username}</span>
        <span className="text-gray-500 dark:text-gray-400">
          <TimeAgo date={topic.createdAt} />
        </span>
      </div>
    </div>
  );
}