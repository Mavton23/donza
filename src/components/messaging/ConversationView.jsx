import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useConversationWebSocket, WS_MESSAGE_TYPES } from '@/hooks/useWebSocket';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';

export default function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Configuração do WebSocket
  const {
    isConnected,
    sendTypingStatus
  } = useConversationWebSocket({
    entityId: conversationId,
    token: token,
    onMessage: useCallback((data) => {
      console.log("ON MESSAGE: ", data.type)
      switch (data.type) {
        case WS_MESSAGE_TYPES.NEW_MESSAGE:

          const normalizedMessage = {
            messageId: data.message.messageId,
            content: data.message.content,
            senderId: data.message.senderId,
            sender: data.message.sender,
            timestamp: data.message.timestamp,
            status: data.message.status || 'sent',
            contextType: data.message.contextType,
            contextId: data.message.contextId,
            ...data.message
          };

          setMessages(prev => {
            const messageExists = prev.some(msg => 
              msg.messageId === normalizedMessage.messageId
            );
            
            if (messageExists) {
              return prev;
            }
            return [...prev, normalizedMessage];
          });

          setConversation(prev => ({
            ...prev,
            lastMessage: normalizedMessage,
            lastMessageAt: normalizedMessage.timestamp || normalizedMessage.createdAt
          }));
          break;
          
        case WS_MESSAGE_TYPES.MESSAGE_UPDATED:
          setMessages(prev => prev.map(msg => 
            msg.messageId === data.message.messageId ? data.message : msg
          ));
          break;
          
        case WS_MESSAGE_TYPES.MESSAGE_DELETED:
          setMessages(prev => prev.filter(msg => 
            msg.messageId !== data.messageId
          ));
          break;
          
        case WS_MESSAGE_TYPES.TYPING_UPDATE:
          // Implementar indicador de digitação se necessário
          console.log('Typing update:', data);
          break;
          
        default:
          console.log('WebSocket message:', data);
      }
    }, []),
    onError: useCallback((error) => {
      setError(prev => prev || `Erro de conexão: ${error}`);
    }, [])
  });

  // Carrega dados da conversa
  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);
        setError(null);

        const [conversationRes, messagesRes] = await Promise.all([
          api.get(`/conversation/conversations/${conversationId}`),
          api.get(`/conversation/conversations/${conversationId}/messages`)
        ]);

        setConversation(conversationRes.data.data);
        setMessages(messagesRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Falha ao carregar conversa');
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId]);

  // Envia mensagem
  const handleSendMessage = async (content, isTicket = false) => {
    try {
      const response = await api.post(
        `/conversation/conversations/${conversationId}/messages`,
        { content, isTicket }
      );
      
      const newMessage = response.data.data;
      setMessages(prev => [...prev, newMessage]);
      
      setConversation(prev => ({
        ...prev,
        lastMessage: newMessage,
        lastMessageAt: new Date().toISOString()
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao enviar mensagem');
    }
  };

  // Atualiza status de digitação
  const handleTypingChange = (isTyping) => {
    sendTypingStatus(isTyping);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!conversation) return <div>Conversa não encontrada</div>;

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader 
        conversation={conversation} 
        currentUser={user}
        isOnline={isConnected}
      />
      
      <MessageThread 
        messages={messages} 
        currentUser={user}
        context={conversation?.type}
      />
      
      <MessageComposer 
        onSend={handleSendMessage}
        onTypingChange={handleTypingChange}
        context={conversation?.type}
        disabled={!isConnected}
        isOnline={isConnected}
        conversationId={conversationId}
        // onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}