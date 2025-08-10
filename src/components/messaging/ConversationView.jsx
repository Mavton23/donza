import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';

export default function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useRef(null);

  // Função para conectar ao WebSocket
  const connectWebSocket = () => {
    if (!conversationId) return;

    // Fecha conexão existente
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Configura a conexão WebSocket
    const wsUrl = `ws://localhost:5000/ws/conversations/${conversationId}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsOnline(true);
    };

    socketRef.current.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      if (type === 'NEW_MESSAGE') {
        setMessages(prev => [...prev, data]);
        
        // Atualiza a última mensagem na conversa ativa
        if (data.conversationId === conversationId) {
          setActiveConversation(prev => ({
            ...prev,
            lastMessage: data,
            lastMessageAt: new Date().toISOString()
          }));
        }
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error instanceof Error ? error.message : error);
      setIsOnline(false);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected - attempting reconnect...');
      setIsOnline(false);
      setTimeout(connectWebSocket, 5000);
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [conversationsRes, messagesRes] = await Promise.all([
          api.get(`/conversation/conversations`),
          api.get(`/conversation/conversations/${conversationId}/messages`)
        ]);
        
        // Encontra a conversa específica pelo ID
        const foundConversation = conversationsRes.data.data.find(
          conv => conv.conversationId === conversationId
        );
        
        if (!foundConversation) {
          throw new Error('Conversation not found');
        }
        
        setConversations(conversationsRes.data.data);
        setActiveConversation(foundConversation);
        setMessages(messagesRes.data.data);
        
        connectWebSocket();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) fetchData();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [conversationId]);

  const handleSendMessage = async (content, isTicket = false) => {
    try {
      const response = await api.post(
        `/conversation/conversations/${conversationId}/messages`,
        { content, isTicket }
      );
      
      const newMessage = response.data.data;
      setMessages(prev => [...prev, newMessage]);
      
      setActiveConversation(prev => ({
        ...prev,
        lastMessage: newMessage,
        lastMessageAt: new Date().toISOString()
      }));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!activeConversation) return <div>Conversation not found</div>;

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader 
        conversation={activeConversation} 
        currentUser={user} 
      />
      <MessageThread 
        messages={messages} 
        currentUser={user}
        context={activeConversation.contextType}
      />
      <MessageComposer 
        onSend={handleSendMessage}
        context={activeConversation.contextType}
        disabled={!isOnline}
        isOnline={isOnline}
        conversationId={conversationId}
        onMarkAsRead={() => {}}
      />
    </div>
  );
}