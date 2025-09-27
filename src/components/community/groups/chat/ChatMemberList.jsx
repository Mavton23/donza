import Avatar from '@/components/common/Avatar';
import { FiUser } from 'react-icons/fi';

export default function ChatMemberList({ members, currentUserId }) {
  const validMembers = members.filter(member => 
    typeof member === 'object' && member !== null && member.userId
  );

  return (
    <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h3 className="font-medium mb-4 flex items-center">
        <FiUser className="mr-2" />
        Membros Online ({validMembers.length})
      </h3>
      
      <div className="space-y-3">
        {validMembers.map(member => (
          <div 
            key={member.userId} 
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="relative">
              <Avatar 
                src={member.avatarUrl} 
                alt={member.username}
                size="sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="ml-3">
              <div className="font-medium">
                {member.username}
                {/* {member.userId === currentUserId && (
                  <span className="ml-1 text-xs text-gray-500">(Você)</span>
                )} */}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {member.role === 'admin' ? 'Administrador' : 'Membro'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}