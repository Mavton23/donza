import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import DebateMessageList from './DebateMessageList';
import DebateChatInput from './DebateChatInput';
import TypingIndicator from './TypingIndicator';
import ChatMemberList from './ChatMemberList';
import TopicSelector from './TopicSelector';
import { useGroupWebSocket, WS_MESSAGE_TYPES } from '@/hooks/useWebSocket';
import { useAuth } from '@/contexts/AuthContext';
import { FiUsers, FiMessageSquare, FiChevronDown, FiHash } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Reducer
function debateReducer(state, action) {
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
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.messageId !== action.payload)
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        isLoading: false
      };
    case 'SET_CURRENT_TOPIC':
      return {
        ...state,
        currentTopic: action.payload
      };
    case 'SET_TOPIC_HISTORY':
      return {
        ...state,
        topicHistory: action.payload
      };
    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: action.payload
      };
    case 'SET_ONLINE_MEMBERS':
      return {
        ...state,
        onlineMembers: action.payload
      };
    case 'SET_HAS_MORE':
      return {
        ...state,
        hasMoreMessages: action.payload
      };
    case 'TOGGLE_MEMBER_LIST':
      return {
        ...state,
        isMemberListOpen: !state.isMemberListOpen
      };
    case 'TOGGLE_TOPIC_SELECTOR':
      return {
        ...state,
        isTopicSelectorOpen: !state.isTopicSelectorOpen
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

export default function DebateChat({ groupId }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const listRef = useRef();
  
  const [state, dispatch] = useReducer(debateReducer, {
    messages: [],
    currentTopic: null,
    topicHistory: [],
    typingUsers: [],
    onlineMembers: [],
    isMemberListOpen: true,
    isTopicSelectorOpen: false,
    isLoading: true,
    hasMoreMessages: true
  });

  // Handler para processar mensagens recebidas via WebSocket
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case WS_MESSAGE_TYPES.CHAT_MESSAGE:
        if (!state.messages.some(m => m.messageId === data.message.messageId)) {
          dispatch({ type: 'ADD_MESSAGE', payload: data.message });
          scrollToBottom();
        }
        break;
        
      case WS_MESSAGE_TYPES.MESSAGE_UPDATED:
        dispatch({ type: 'UPDATE_MESSAGE', payload: data.message });
        break;
        
      case WS_MESSAGE_TYPES.MESSAGE_DELETED:
        dispatch({ type: 'DELETE_MESSAGE', payload: data.messageId });
        break;
        
      case WS_MESSAGE_TYPES.TYPING_STATUS:
        dispatch({ 
          type: 'SET_TYPING_USERS', 
          payload: data.users.filter(u => u.userId !== user.userId && state.onlineMembers.includes(u.userId))
        });
        break;
        
      case WS_MESSAGE_TYPES.USER_STATUS_UPDATE:
        if (data.users) {
          dispatch({ type: 'SET_ONLINE_MEMBERS', payload: data.users });
        }
        if (data.userId && data.isOnline !== undefined) {
          dispatch({
            type: 'SET_ONLINE_MEMBERS',
            payload: data.isOnline
              ? [...new Set([...state.onlineMembers, data.userId])]
              : state.onlineMembers.filter(id => id !== data.userId)
          });
        }
        break;
        
      case WS_MESSAGE_TYPES.TOPIC_CHANGED:
        dispatch({ type: 'SET_CURRENT_TOPIC', payload: data.topic });
        toast.success(`Tópico atualizado: ${data.topic.topic}`);
        break;
        
      case WS_MESSAGE_TYPES.CONNECTION_ESTABLISHED:
        toast.success('Conectado ao debate');
        loadInitialData();
        break;
        
      case WS_MESSAGE_TYPES.ERROR:
        toast.error(`Erro no debate: ${data.message}`);
        break;
        
      default:
        break;
    }
  }, [state.messages, state.onlineMembers, user.userId]);

  const handleStatusChange = useCallback((status, data) => {
    if (status === 'disconnected') {
      toast.warning('Conexão perdida, reconectando...');
    }
  }, []);

  const handleError = useCallback((error) => {
    console.error('Erro WebSocket:', error);
    toast.error(`Erro de conexão: ${error}`);
  }, []);

  // WebSocket Hook para grupos
  const { 
    sendMessage: sendWsMessage, 
    sendTypingStatus,
    markMessageAsRead,
    changeTopic,
    deleteMessage,
    isConnected,
    connect
  } = useGroupWebSocket({
    entityId: groupId,
    token: token,
    onMessage: handleWebSocketMessage,
    onStatusChange: handleStatusChange,
    onError: handleError
  });

  // Rolagem automática para o final
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  // Carrega dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await Promise.all([
        loadMessages(), 
        loadActiveMembers(),
        loadCurrentTopic(),
        loadTopicHistory()
      ]);
      updateMemberStatus(true);
    } catch (error) {
      toast.error('Erro ao carregar dados do debate');
      console.error(error);
    }
  }, [groupId]);

  // Carrega mensagens com paginação
  const loadMessages = useCallback(async (offset = 0) => {
    try {
      const { data } = await api.get(`/chat/groups/${groupId}/chat/messages`, {
        params: { limit: 50, offset }
      });
      
      dispatch({ 
        type: 'SET_HAS_MORE', 
        payload: data.data.length >= 50 
      });
      
      if (offset === 0) {
        dispatch({ type: 'SET_MESSAGES', payload: data.data.reverse() });
        scrollToBottom();
      } else {
        const beforeHeight = listRef.current?.scrollHeight || 0;
        dispatch({ type: 'SET_MESSAGES', payload: [...data.data.reverse(), ...state.messages] });
        
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - beforeHeight;
          }
        });
      }
    } catch (error) {
      toast.error('Falha ao carregar mensagens');
      console.error('Error loading messages:', error);
    }
  }, [groupId, state.messages]);

  // Carrega membros ativos
  const loadActiveMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/groups/${groupId}/chat/members`, {
        params: { lastMinutes: 30 }
      });
      dispatch({ type: 'SET_ONLINE_MEMBERS', payload: data.data });
    } catch (error) {
      console.error('Error loading active members:', error);
    }
  }, [groupId]);

  // Carrega tópico atual
  const loadCurrentTopic = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/groups/${groupId}/chat/topic`);
      dispatch({ type: 'SET_CURRENT_TOPIC', payload: data.data });
    } catch (error) {
      console.error('Error loading current topic:', error);
    }
  }, [groupId]);

  // Carrega histórico de tópicos
  const loadTopicHistory = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/groups/${groupId}/chat/topic/history`, {
        params: { limit: 10 }
      });
      dispatch({ type: 'SET_TOPIC_HISTORY', payload: data.data });
    } catch (error) {
      console.error('Error loading topic history:', error);
    }
  }, [groupId]);

  // Atualiza status do membro
  const updateMemberStatus = useCallback(async (isActive) => {
    try {
      await api.patch(`/chat/groups/${groupId}/chat/members/me`, { isActive });
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  }, [groupId]);

  // Envia mensagem (otimista)
  const handleSendMessage = useCallback(async (content) => {
    if (!state.currentTopic) {
      toast.warning('Defina um tópico antes de enviar mensagens');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      messageId: tempId,
      content: content.text,
      sender: {
        userId: user.userId,
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      createdAt: new Date().toISOString(),
      topicId: state.currentTopic.topicId,
      isTemp: true
    };

    // Atualização otimista
    dispatch({ type: 'ADD_MESSAGE', payload: tempMessage });
    scrollToBottom();

    try {
      // Envia via WebSocket
      sendWsMessage(content.text, {
        topicId: state.currentTopic.topicId,
        ...(content.file && { 
          metadata: { 
            file: {
              name: content.file.name,
              type: content.file.type,
              size: content.file.size
            }
          }
        })
      });

      // Marca mensagens como lidas
      state.messages.forEach(msg => {
        if (!msg.readBy?.includes(user.userId)) {
          markMessageAsRead(msg.messageId);
        }
      });
    } catch (error) {
      // Reverte se falhar
      dispatch({ type: 'DELETE_MESSAGE', payload: tempId });
      toast.error('Falha ao enviar mensagem');
      console.error('Error sending message:', error);
    }
  }, [groupId, user, state.currentTopic, state.messages, sendWsMessage, markMessageAsRead]);

  // Edita mensagem
  const handleEditMessage = useCallback(async (messageId, newContent) => {
    try {
      const originalMessage = state.messages.find(m => m.messageId === messageId);
      if (!originalMessage) return;

      // Atualização otimista
      const tempMessage = {
        ...originalMessage,
        content: newContent,
        edited: true,
        isTemp: true
      };
      dispatch({ type: 'UPDATE_MESSAGE', payload: tempMessage });

      // Envia atualização via WebSocket
      sendWsMessage(newContent, {
        messageId: messageId,
        isEdit: true
      });

      toast.success('Mensagem editada');
    } catch (error) {
      toast.error('Erro ao editar mensagem');
      console.error('Error editing message:', error);
    }
  }, [state.messages, sendWsMessage]);

  // Deleta mensagem
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      // Otimista: remove imediatamente do estado
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });

      // Envia deleção via WebSocket
      deleteMessage(messageId);

      toast.success('Mensagem deletada');
    } catch (error) {
      toast.error('Erro ao deletar mensagem');
      console.error('Error deleting message:', error);
    }
  }, [deleteMessage]);

  const handleMessageRead = useCallback((messageId) => {
    const message = state.messages.find(msg => msg.messageId === messageId);
    if (!message || message.readBy?.includes(user.userId)) return;

    try {
      markMessageAsRead(messageId);
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }, [state.messages, user.userId, markMessageAsRead]);

  // Define novo tópico
  const handleSetTopic = useCallback(async (topic) => {
    try {
      // Atualização otimista
      const newTopic = {
        topic,
        setBy: { userId: user.userId, username: user.username },
        setAt: new Date().toISOString()
      };
      dispatch({ type: 'SET_CURRENT_TOPIC', payload: newTopic });

      // Envia via WebSocket
      changeTopic(topic);
      
      toast.success('Tópico atualizado');
    } catch (error) {
      toast.error('Falha ao atualizar tópico');
      console.error('Error setting topic:', error);
    }
  }, [user, changeTopic]);

  // Status de digitação
  const handleTyping = useCallback((isTyping) => {
    sendTypingStatus(isTyping);
    updateMemberStatus(true);
  }, [sendTypingStatus, updateMemberStatus]);

  // Efeitos
  useEffect(() => {
    loadInitialData();
    return () => updateMemberStatus(false);
  }, [groupId]);

  useEffect(() => {
    if (isConnected) {
      loadActiveMembers();
    }
  }, [isConnected]);

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Área principal do debate */}
      <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-gray-800">
        {/* Cabeçalho com tópico atual */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiMessageSquare className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Debate do Grupo</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_TOPIC_SELECTOR' })}
                className="text-sm bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-3 py-1 rounded-md"
              >
                {state.currentTopic ? 'Alterar Tópico' : 'Definir Tópico'}
              </button>
              
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_MEMBER_LIST' })}
                className="md:hidden flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiUsers className="mr-1" />
                <FiChevronDown className={`transition-transform ${state.isMemberListOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {state.currentTopic && (
            <div className="mt-2 flex items-center">
              <FiHash className="text-blue-500 dark:text-blue-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {state.currentTopic.topic}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Definido por {state.currentTopic.setBy.username} • {new Date(state.currentTopic.setAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          <TypingIndicator typingUsers={state.typingUsers} />
        </div>
        
        {/* Lista de mensagens */}
        <div className="flex-1 p-4 overflow-y-auto" ref={listRef}>
          <DebateMessageList 
            messages={state.messages}
            currentUserId={user.userId}
            currentTopic={state.currentTopic}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onMessageRead={handleMessageRead}
            hasMore={state.hasMoreMessages}
            loadMore={() => loadMessages(state.messages.length)}
            isLoading={state.isLoading}
          />
        </div>
        
        {/* Input de mensagem */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
          <DebateChatInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            placeholder={state.currentTopic 
              ? `Discutir sobre "${state.currentTopic.topic}"...`
              : 'Defina um tópico para começar o debate'}
            disabled={!state.currentTopic || !isConnected}
          />
          {!isConnected && (
            <div className="text-xs text-red-500 mt-1">
              Conectando ao chat...
            </div>
          )}
        </div>
      </div>
      
      {/* Painel lateral */}
      <div className={`${state.isMemberListOpen ? 'flex' : 'hidden'} md:flex w-80 flex-col bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-800`}>
        {state.isTopicSelectorOpen && (
          <TopicSelector 
            currentTopic={state.currentTopic}
            topicHistory={state.topicHistory}
            onSetTopic={handleSetTopic}
            onClose={() => dispatch({ type: 'TOGGLE_TOPIC_SELECTOR' })}
            isLeader={user.role === 'leader' || user.role === 'co-leader'}
          />
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <FiUsers className="text-blue-500 dark:text-blue-400 mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Membros Online ({state.onlineMembers.length})
              </h3>
            </div>
          </div>
          
          <ChatMemberList 
            members={state.onlineMembers} 
            currentUserId={user.userId}
            className="flex-1 overflow-y-auto p-2"
          />
          
          <div className="p-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            {state.onlineMembers.length === 1 
              ? "Você é o único online" 
              : `${state.onlineMembers.length} membros online agora`}
          </div>
        </div>
      </div>
    </div>
  );
}