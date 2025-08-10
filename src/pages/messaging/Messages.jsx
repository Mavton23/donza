import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessagesSquare, MailWarning, MailPlus } from 'lucide-react';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ConversationList from '@/components/messaging/ConversationList';
import MessageThread from '@/components/messaging/MessageThread';
import MessageComposer from '@/components/messaging/MessageComposer';
import MessagingHeader from '@/components/messaging/MessagingHeader';
import ContextSelector from '@/components/messaging/ContextSelector';
import MessageLimitIndicator from '@/components/messaging/MessageLimitIndicator';

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageCountToday, setMessageCountToday] = useState(0);
  const [showContextModal, setShowContextModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [conversationsRes, countRes] = await Promise.all([
          api.get('/conversation/conversations'),
          api.get('/conversation/messages/today-count')
        ]);
        
        setConversations(conversationsRes.data.data || []);
        setMessageCountToday(countRes.data.data?.count || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(response.data.data);
        setActiveConversation(
          conversations.find(c => c.conversationId === conversationId)
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, conversations]);

  const handleSendMessage = async (content, isTicket = false) => {
    try {
      const response = await api.post(
        `/conversations/${conversationId}/messages`,
        { content, isTicket }
      );
      
      setMessages([...messages, response.data.data]);
      setMessageCountToday(prev => prev + 1);
      
      setConversations(conversations.map(conv => 
        conv.conversationId === conversationId 
          ? { ...conv, lastMessageAt: new Date().toISOString() }
          : conv
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      
      if (err.response?.data?.code === 'MESSAGE_LIMIT_EXCEEDED') {
        setShowContextModal(true);
      }
    }
  };

  const handleMarkAsRead = async (conversationId) => {
    try {
      await api.patch(`/conversations/${conversationId}/read`);
      setConversations(conversations.map(conv => 
        conv.conversationId === conversationId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleStartConversation = async (context) => {
    try {
      setLoading(true);
      
      if (context.useExisting && context.conversationId) {
        const response = await api.post(
          `/conversations/${context.conversationId}/messages`,
          { content: context.message, isTicket: context.isTicket }
        );
        
        // Atualiza o estado
        if (activeConversation?.conversationId === context.conversationId) {
          setMessages(prev => [...prev, response.data.data]);
        }
        
        // Atualiza a lista de conversas
        setConversations(prev => prev.map(conv => 
          conv.conversationId === context.conversationId
            ? { 
                ...conv, 
                lastMessage: response.data.data,
                lastMessageAt: new Date().toISOString() 
              }
            : conv
        ));
        
        navigate(`/messages/${context.conversationId}`);
        return;
      }
  
      const response = await api.post('/conversations', {
        participants: [context.recipientId],
        contextType: context.type,
        contextId: context.id,
        initialMessage: context.message
      });
      
      // Adiciona a nova conversa à lista
      setConversations(prev => [...prev, response.data.data]);
      navigate(`/messages/${response.data.data.conversationId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
      setShowContextModal(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <MessagingHeader 
        onNewMessage={() => setShowContextModal(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {user?.role === 'student' && (
            <MessageLimitIndicator 
              current={messageCountToday} 
              limit={user.messagePreferences?.dailyMessageLimit || 5} 
            />
          )}
          <ConversationList 
            conversations={conversations}
            activeConversation={conversationId}
            onSelect={(id) => navigate(`/messages/${id}`)}
          />
        </div>

        {/* Message area */}
        <div className="flex-1 flex flex-col">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}

          {conversationId ? (
            <>
              <MessageThread 
                messages={messages} 
                currentUser={user}
                context={activeConversation?.contextType}
              />
              <MessageComposer 
                onSend={handleSendMessage}
                context={activeConversation?.contextType}
                disabled={user?.role === 'student' && 
                  messageCountToday >= (user.messagePreferences?.dailyMessageLimit || 5)}
                conversationId={conversationId}
                onMarkAsRead={handleMarkAsRead}
              />
            </>
          ) : (
            <EmptyState
              title={conversations.length ? "Select a conversation" : "No conversations"}
              description={
                conversations.length 
                  ? "Choose a conversation from the list" 
                  : "Start a new conversation to begin messaging"
              }
              icon={conversations.length ? MessagesSquare : MailPlus}
            />
          )}
        </div>
      </div>

      {/* Context selector modal */}
      {showContextModal && (
        <ContextSelector
          onClose={() => setShowContextModal(false)}
          onSubmit={handleStartConversation}
          user={user}
          existingConversations={conversations}
        />
      )}
    </div>
  );
}