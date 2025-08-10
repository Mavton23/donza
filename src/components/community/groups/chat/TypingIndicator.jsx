import Avatar from '@/components/common/Avatar';

export default function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map(user => (
          <Avatar 
            key={user.userId}
            src={user.avatarUrl} 
            alt={user.username}
            size="xs"
            className="border-2 border-white dark:border-gray-800"
          />
        ))}
      </div>
      <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
        {typingUsers.length > 3 
          ? `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`
          : typingUsers.length === 1
            ? `${typingUsers[0].username} is typing...`
            : `${typingUsers.map(u => u.username).join(' and ')} are typing...`}
      </div>
      <div className="flex ml-2 space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}