import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import TimeAgo from '../common/TimeAgo';
import EmptyState from '../common/EmptyState';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConversationList({ 
  conversations = [], 
  activeConversation, 
  onSelect 
}) {
  const { currentUser } = useAuth();
  console.log("CONVERSATION: ", conversations);

  if (!Array.isArray(conversations)) {
    return (
      <EmptyState
        title="Erro ao carregar conversas"
        description="Não foi possível carregar a lista de conversas"
        icon="alert-circle"
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Nenhuma conversa encontrada"
        description="Você ainda não iniciou nenhuma conversa"
        icon={MessageSquare}
      />
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map(conversation => {
        const otherParticipant = conversation.participants?.find(
          p => p.userId !== currentUser?.userId
        ) || {};

        return (
          <Link
            key={conversation.conversationId}
            to={`/messages/${conversation.conversationId}`}
            className={`block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              activeConversation === conversation.conversationId 
                ? 'bg-gray-50 dark:bg-gray-800' 
                : ''
            }`}
            onClick={() => onSelect(conversation.conversationId)}
          >
            <div className="flex items-center">
              <Avatar 
                user={otherParticipant}
                size="md"
              />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {otherParticipant.username || 'Usuário desconhecido'}
                  </h3>
                  {conversation.lastMessage?.createdAt && (
                    <TimeAgo 
                      date={conversation.lastMessage.createdAt} 
                      className="text-xs text-gray-500 flex-shrink-0"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage?.content || 'Nenhuma mensagem ainda'}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}