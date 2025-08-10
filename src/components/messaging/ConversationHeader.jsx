import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '../common/Avatar';

export default function ConversationHeader({ conversation, currentUser }) {
  const navigate = useNavigate();
  console.log(conversation)
  const otherParticipant = conversation?.participants?.find(
    p => p.userId !== currentUser?.userId
  );

  return (
    <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button 
        onClick={() => navigate('/messages')}
        className="mr-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
      
      {otherParticipant && (
        <div className="flex items-center">
          <Avatar user={otherParticipant} size="md" />
          <div className="ml-3">
            <h2 className="font-medium text-gray-900 dark:text-white">
              {otherParticipant?.username || "Unknown user"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.contextType === 'course' 
                ? 'Conversa de curso' 
                : conversation.contextType === 'support' 
                  ? 'Suporte técnico' 
                  : 'Mensagem direta'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}