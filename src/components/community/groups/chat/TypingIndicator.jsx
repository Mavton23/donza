import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';

export default function TypingIndicator({ typingUsers, onlineMembers }) {
  const { user } = useAuth();
  
  if (typingUsers.length === 0) return null;

  // Converter IDs para objetos de usuário usando onlineMembers
  const typingUserObjects = typingUsers.map(userId => {
    const userObj = onlineMembers.find(member => member.userId === userId);
    return userObj || { userId, username: 'Usuário', avatarUrl: null };
  }).filter(userObj => userObj.userId !== user.userId); // Filtrar usuário atual

  if (typingUserObjects.length === 0) return null;

  return (
    <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
      <div className="flex -space-x-2">
        {typingUserObjects.slice(0, 3).map(user => (
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
        {typingUserObjects.length > 3 
          ? `${typingUserObjects[0].username} e ${typingUserObjects.length - 1} outros estão digitando...`
          : typingUserObjects.length === 1
            ? `${typingUserObjects[0].username} está digitando...`
            : `${typingUserObjects.map(u => u.username).join(' e ')} estão digitando...`}
      </div>
      <div className="flex ml-2 space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}