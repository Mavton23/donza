import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessagesSquare, MailPlus, Menu, X } from 'lucide-react'; // Adicionei ícones de menu
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ConversationList from '@/components/messaging/ConversationList';
import MessageThread from '@/components/messaging/MessageThread';
import MessageComposer from '@/components/messaging/MessageComposer';
import MessagingHeader from '@/components/messaging/MessagingHeader';
import ContextSelector from '@/components/messaging/ContextSelector';
import MessageLimitIndicator from '@/components/messaging/MessageLimitIndicator';
import { useConversationWebSocket, WS_MESSAGE_TYPES } from '@/hooks/useWebSocket';
import { v4 as uuidv4 } from 'uuid';

// Reducer para gerenciar estado das mensagens (mantido igual)
function messagesReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [action.payload, ...state.messages]
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.messageId === action.payload.messageId ? action.payload : msg
        )
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        isLoading: false
      };
    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: action.payload
      };
    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [messageCountToday, setMessageCountToday] = useState(0);
  const [showContextModal, setShowContextModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Novo estado para controle responsivo
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations' | 'thread'
  
  const [state, dispatch] = useReducer(messagesReducer, {
    messages: [],
    typingUsers: [],
    onlineUsers: [],
    isLoading: true,
    error: null
  });

  // Refs para valores que mudam mas não devem trigger re-renders
  const messagesRef = useRef(state.messages);

  // Atualizar refs quando state mudar
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  // Handlers estáveis que não mudam com as dependências (mantidos iguais)
  const handleNewMessage = useCallback((message) => {
    if (!messagesRef.current.some(m => m.messageId === message.messageId)) {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }
  }, []);

  const handleMessageDelivered = useCallback((messageId) => {
    const message = messagesRef.current.find(m => m.messageId === messageId);
    if (message) {
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { ...message, status: 'delivered' }
      });
    }
  }, []);

  const handleMessageRead = useCallback((messageId, readAt) => {
    const message = messagesRef.current.find(m => m.messageId === messageId);
    if (message) {
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { ...message, status: 'read', readAt }
      });
    }
  }, []);

  const handleTypingUpdate = useCallback((typingUsers) => {
    dispatch({ type: 'SET_TYPING_USERS', payload: typingUsers || [] });
  }, []);

  const handleUserStatusUpdate = useCallback((onlineUsers) => {
    dispatch({ type: 'SET_ONLINE_USERS', payload: onlineUsers || [] });
  }, []);

  const handleWebSocketError = useCallback((errorMessage) => {
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  }, []);

  // WebSocket apenas para receber atualizações em tempo real (mantido igual)
  const {
    isConnected: isWsConnected,
    sendTypingStatus,
    connect: connectWs,
    disconnect: disconnectWs
  } = useConversationWebSocket({
    entityId: conversationId,
    token: user?.token,
    onMessage: useCallback((data) => {
      console.log('WebSocket message received:', data);
      
      switch (data.type) {
        case WS_MESSAGE_TYPES.NEW_MESSAGE:
          handleNewMessage(data.message);
          break;
          
        case WS_MESSAGE_TYPES.MESSAGE_DELIVERED:
          handleMessageDelivered(data.messageId);
          break;
          
        case WS_MESSAGE_TYPES.MESSAGE_READ:
          handleMessageRead(data.messageId, data.readAt);
          break;
          
        case WS_MESSAGE_TYPES.TYPING_UPDATE:
          handleTypingUpdate(data.typingUsers);
          break;
          
        case WS_MESSAGE_TYPES.USER_STATUS_UPDATE:
          handleUserStatusUpdate(data.onlineUsers);
          break;
          
        case WS_MESSAGE_TYPES.ERROR:
          handleWebSocketError(data.message);
          break;
          
        default:
          console.log('Unhandled message type:', data.type);
      }
    }, [handleNewMessage, handleMessageDelivered, handleMessageRead, handleTypingUpdate, handleUserStatusUpdate, handleWebSocketError]),
    onStatusChange: useCallback((status) => {
      console.log('WebSocket status:', status);
    }, []),
    onError: useCallback((error) => {
      console.error('WebSocket connection error:', error);
      handleWebSocketError('Erro de conexão em tempo real');
    }, [handleWebSocketError])
  });

  // Carrega conversas e contagem de mensagens (mantido igual)
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
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err.response?.data?.message || 'Falha ao carregar dados' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carrega mensagens quando a conversa muda - COM RESPONSIVIDADE
  useEffect(() => {
    if (!conversationId) {
      disconnectWs();
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      
      // Em mobile, mostra lista de conversas quando não há conversa selecionada
      if (window.innerWidth < 768) {
        setCurrentView('conversations');
      }
      return;
    }

    const fetchMessages = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.get(`/conversations/${conversationId}/messages`);
        dispatch({ type: 'SET_MESSAGES', payload: response.data.data || [] });
        
        // Conecta WebSocket apenas para receber atualizações em tempo real
        if (user?.token) {
          connectWs();
        }

        // Marca mensagens como lidas após carregar
        markMessagesAsRead(conversationId);

        // Em mobile, muda para view da thread quando conversa é selecionada
        if (window.innerWidth < 768) {
          setCurrentView('thread');
          setIsMobileSidebarOpen(false);
        }
      } catch (err) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err.response?.data?.message || 'Falha ao carregar mensagens' 
        });
      }
    };

    fetchMessages();

    return () => disconnectWs();
  }, [conversationId, user?.token]);

  // Marca mensagens como lidas via API REST (mantido igual)
  const markMessagesAsRead = useCallback(async (convId) => {
    try {
      await api.post(`/conversations/${convId}/mark-read`);
      
      // Atualiza UI localmente
      setConversations(prev => prev.map(conv => 
        conv.conversationId === convId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      ));

      // Atualiza status das mensagens para lidas
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: state.messages.map(msg => ({
          ...msg,
          status: msg.senderId !== user.userId ? 'read' : msg.status
        }))
      });
    } catch (err) {
      console.error('Falha ao marcar como lido:', err);
    }
  }, [state.messages, user.userId]);

  // Envia mensagem via API REST (mantido igual)
  const handleSendMessage = useCallback(async (content, isTicket = false) => {
    if (!conversationId) return;

    let tempMessage;
    try {
      // Cria mensagem temporária para otimismo UI
      tempMessage = {
        messageId: `temp-${Date.now()}`,
        content: content,
        senderId: user.userId,
        sender: {
          userId: user.userId,
          username: user.username,
          avatarUrl: user.avatarUrl
        },
        timestamp: new Date().toISOString(),
        status: 'sending',
        isTemp: true
      };

      dispatch({ type: 'ADD_MESSAGE', payload: tempMessage });

      // Envia via API REST (não via WebSocket)
      const response = await api.post(
        `/conversations/${conversationId}/messages`,
        { content, isTicket }
      );

      // Substitui mensagem temporária pela real
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: {
          ...response.data.data,
          isTemp: false,
          status: 'sent'
        }
      });

      setMessageCountToday(prev => prev + 1);
      
      // Atualiza lista de conversas
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversationId 
          ? { 
              ...conv, 
              lastMessage: response.data.data,
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0
            }
          : conv
      ));

    } catch (err) {
      // Remove mensagem temporária em caso de erro
      if (tempMessage) {
        dispatch({ 
          type: 'UPDATE_MESSAGE', 
          payload: {
            ...tempMessage,
            status: 'error',
            error: err.response?.data?.message
          }
        });
      }

      if (err.response?.data?.code === 'MESSAGE_LIMIT_EXCEEDED') {
        setShowContextModal(true);
      }
    }
  }, [conversationId, user]);

  // Status de digitação (mantido igual)
  const handleTyping = useCallback((isTyping) => {
    if (conversationId) {
      sendTypingStatus(isTyping);
    }
  }, [conversationId, sendTypingStatus]);

  // Inicia nova conversa (mantido igual)
  const handleStartConversation = useCallback(async (context) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
        if (context.useExisting && context.conversationId) {
        // Envia mensagem via REST para conversa existente
        await api.post(
          `/conversations/${context.conversationId}/messages`,
          { 
            content: context.message, 
            isTicket: context.isTicket,
            contextType: context.type,
            contextId: context.id
          }
        );
        
        navigate(`/messages/${context.conversationId}`);
        return;
      }

      // Cria nova conversa via REST
      const response = await api.post('/conversation/conversations', {
        participants: [context.recipientId],
        type: context.type,
        contextId: uuidv4(),
        initialMessage: context.message,
        isTicket: context.isTicket
      });

      const newConversation = response.data.data;
      
      setConversations(prev => [...prev, newConversation]);
      navigate(`/messages/${newConversation.conversationId}`);
    } catch (err) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: err.response?.data?.message || 'Falha ao iniciar conversa' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setShowContextModal(false);
    }
  }, [navigate]);

  // Handlers para responsividade
  const handleBackToConversations = useCallback(() => {
    if (window.innerWidth < 768) {
      setCurrentView('conversations');
      navigate('/messages');
    }
  }, [navigate]);

  const handleSelectConversation = useCallback((id) => {
    navigate(`/messages/${id}`);
    
    // Em mobile, fecha sidebar após seleção
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  }, [navigate]);

  const activeConversation = conversations.find(c => c.conversationId === conversationId);

  if (state.isLoading && !conversationId) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <MessagingHeader 
        onNewMessage={() => setShowContextModal(true)}
        // Adiciona botão de menu para mobile
        showMenuButton={window.innerWidth < 768 && currentView === 'thread'}
        onMenuClick={() => setCurrentView('conversations')}
      />
      
      {state.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4 rounded">
          <div className="flex justify-between items-center">
            <p>{state.error}</p>
            <button 
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden flex">
        {/* Conversation sidebar - AGORA RESPONSIVA */}
        <div className={`
          ${window.innerWidth >= 768 ? 'w-1/3 flex' : 
            currentView === 'conversations' ? 'w-full flex' : 'hidden'}
          border-r border-gray-200 dark:border-gray-700 flex-col
          transition-all duration-300 ease-in-out
        `}>
          {/* Header mobile para conversas */}
          {window.innerWidth < 768 && currentView === 'conversations' && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Conversas</h2>
              <button
                onClick={() => setShowContextModal(true)}
                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                <MailPlus size={20} />
              </button>
            </div>
          )}
          
          {user?.role === 'student' && (
            <MessageLimitIndicator 
              current={messageCountToday} 
              limit={user.messagePreferences?.dailyMessageLimit || 5} 
            />
          )}
          
          {loading ? (
            <div className='flex items-center justify-center min-h-[200px] w-full'>
              <LoadingSpinner 
                size='small' 
                withText 
                text='Carregando mensagens' 
                inline
              />
            </div> 
          ) : (
            <ConversationList 
              conversations={conversations}
              activeConversation={conversationId}
              onSelect={handleSelectConversation}
              onlineUsers={state.onlineUsers}
            />
          )}
        </div>

        {/* Message area - AGORA RESPONSIVA */}
        <div className={`
          ${window.innerWidth >= 768 ? 'flex-1 flex' : 
            currentView === 'thread' ? 'w-full flex' : 'hidden'}
          flex-col transition-all duration-300 ease-in-out
        `}>
          {/* Header mobile para thread */}
          {window.innerWidth < 768 && currentView === 'thread' && conversationId && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={handleBackToConversations}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold flex-1 text-center">
                {activeConversation?.participants?.[0]?.username || 'Conversa'}
              </h2>
              <div className="w-10"></div> {/* Espaçamento para balancear */}
            </div>
          )}
          
          {conversationId ? (
            <>
              <MessageThread 
                messages={state.messages} 
                currentUser={user}
                context={activeConversation?.contextType}
                typingUsers={state.typingUsers}
                onlineUsers={state.onlineUsers}
                onBack={window.innerWidth < 768 ? handleBackToConversations : undefined}
              />
              <MessageComposer 
                onSend={handleSendMessage}
                onTyping={handleTyping}
                context={activeConversation?.contextType}
                disabled={user?.role === 'student' && 
                  messageCountToday >= (user.messagePreferences?.dailyMessageLimit || 5)}
                connectionStatus={isWsConnected ? 'connected' : 'disconnected'}
              />
            </>
          ) : (
            <EmptyState
              title={conversations.length ? "Selecione uma conversa" : "Nenhuma conversa"}
              description={
                conversations.length 
                  ? "Escolha uma conversa da lista" 
                  : "Inicie uma nova conversa para começar a trocar mensagens"
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