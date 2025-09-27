import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import CommunityMessageList from '@/components/community/CommunityMessageList';
import CommunityChatInput from '@/components/community/CommunityChatInput';
import TypingIndicator from '@/components/community/groups/chat/TypingIndicator';
import ChatMemberList from '@/components/community/groups/chat/ChatMemberList';
import { useCommunityWebSocket, WS_MESSAGE_TYPES } from '@/hooks/useWebSocket';
import useMarkCommunityMessageAsRead from '@/hooks/useMarkCommunityMessageAsRead';
import { useAuth } from '@/contexts/AuthContext';
import { FiUsers, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';


// Reducer para comunidade
function communityReducer(state, action) {
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
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

export default function CommunityChatRoom({ communityId, userRole, isMember }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const listRef = useRef();
  
  const [state, dispatch] = useReducer(communityReducer, {
    messages: [],
    typingUsers: [],
    onlineMembers: [],
    isMemberListOpen: true,
    isLoading: true,
    hasMoreMessages: true
  });

  const fetchUserData = useCallback(async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        userId,
        username: 'Membro',
        avatarUrl: null,
        role: 'member'
      };
    }
  }, []);

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
      
      case WS_MESSAGE_TYPES.TYPING_UPDATE:
        console.log("TYPING_UPDATE received:", data);
        
        if (data.typingUsers) {
          dispatch({
            type: 'SET_TYPING_USERS',
            payload: data.typingUsers.filter(id => id !== user.userId)
          });
        } else if (data.userId !== undefined && data.isTyping !== undefined) {
          if (data.isTyping) {
            if (!state.typingUsers.includes(data.userId)) {
              dispatch({
                type: 'SET_TYPING_USERS',
                payload: [...state.typingUsers, data.userId]
              });
            }
          } else {
            dispatch({
              type: 'SET_TYPING_USERS',
              payload: state.typingUsers.filter(id => id !== data.userId)
            });
          }
        }
        break;
        
      case WS_MESSAGE_TYPES.USER_STATUS_UPDATE:
        if (data.users) {
          dispatch({ type: 'SET_ONLINE_MEMBERS', payload: data.users });
        } else if (data.userId && data.isOnline !== undefined) {
          if (data.isOnline) {
            // Busca dados do usuário antes de adicionar
            fetchUserData(data.userId).then(userData => {
              dispatch({
                type: 'SET_ONLINE_MEMBERS',
                payload: [...state.onlineMembers.filter(m => m.userId !== data.userId), userData]
              });
            });
          } else {
            dispatch({
              type: 'SET_ONLINE_MEMBERS',
              payload: state.onlineMembers.filter(member => member.userId !== data.userId)
            });
          }
        }
        break;
        
      case WS_MESSAGE_TYPES.CONNECTION_ESTABLISHED:
        toast.success('Conectado ao chat');
        loadInitialData();
        break;
        
      case WS_MESSAGE_TYPES.ERROR:
        toast.error(`Erro no chat: ${data.message}`);
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
    toast.error(`Erro de conexão: ${error}`);
  }, []);

  const markCommunityMessageRead = useMarkCommunityMessageAsRead(communityId);

  const { 
    sendMessage: sendWsMessage, 
    sendTypingStatus,
    markMessageAsRead,
    deleteMessage,
    isConnected
  } = useCommunityWebSocket({
    entityId: communityId,
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
        loadActiveMembers()
      ]);
      updateMemberStatus(true);
    } catch (error) {
      toast.error('Erro ao carregar dados do chat');
      console.error(error);
    }
  }, [communityId]);

  // Carrega mensagens com paginação
  const loadMessages = useCallback(async (offset = 0) => {
    try {
      const { data } = await api.get(`/communitychat/${communityId}/messages`, {
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
  }, [communityId, state.messages]);

  // Carrega membros ativos
  const loadActiveMembers = useCallback(async () => {
    try {
      const { data } = await api.get(`/communitychat/${communityId}/active-members`);
      dispatch({ type: 'SET_ONLINE_MEMBERS', payload: data.data });
    } catch (error) {
      console.error('Error loading active members:', error);
    }
  }, [communityId]);

  // Atualiza status do membro
  const updateMemberStatus = useCallback(async (isActive) => {
    try {
      await api.patch(`/communitychat/${communityId}/members/me/status`, { isActive });
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  }, [communityId]);

  // Envia mensagem
  const handleSendMessage = useCallback(async (content) => {
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
      isTemp: true
    };

    // Atualização otimista
    dispatch({ type: 'ADD_MESSAGE', payload: tempMessage });
    scrollToBottom();

    try {
      const response = await api.post(`/communitychat/${communityId}/messages`, {
        content: content.text,
        ...(content.replyToId && { replyToId: content.replyToId })
      })

      dispatch({ type: 'UPDATE_MESSAGE', payload: {
        ...response.data.data,
        isTemp: false
      }});

      // Marcar APENAS a última mensagem anterior como lida, não todas
      const lastMessage = state.messages[0]; // Mensagem mais recente
      if (lastMessage && (!lastMessage.readBy || !lastMessage.readBy[user.userId])) {
          markCommunityMessageRead(lastMessage.messageId);
      }
    } catch (error) {
      // Reverte se falhar
      dispatch({ type: 'DELETE_MESSAGE', payload: tempId });
      toast.error('Falha ao enviar mensagem');
      console.error('Error sending message:', error);
    }
  }, [communityId, user, state.messages, markCommunityMessageRead]);

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
    if (!message || (message.readBy && message.readBy[user.userId])) return;

    try {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
            ...message,
            readBy: {
                ...message.readBy,
                [user.userId]: new Date().toISOString()
            }
        }
      });

      markCommunityMessageRead(messageId)

      markMessageAsRead(messageId);
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }, [state.messages, user.userId, markCommunityMessageRead, markMessageAsRead]);

  // Status de digitação
  const handleTyping = useCallback((isTyping) => {
    sendTypingStatus(isTyping);
    updateMemberStatus(true);
  }, [sendTypingStatus, updateMemberStatus]);

  // Efeitos
  useEffect(() => {
    if (isMember) {
      loadInitialData();
    }
    return () => updateMemberStatus(true); // nunca mutado (por enquanto)
  }, [communityId, isMember]);

  useEffect(() => {
    if (isConnected && isMember) {
      loadActiveMembers();
    }
  }, [isConnected, isMember]);

  if (!isMember) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <FiUsers size={48} className="mx-auto mb-3" />
          <h3 className="text-lg font-medium">Participe da comunidade</h3>
          <p className="mt-1">Você precisa ser membro para acessar o chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-gray-800">
        {/* Cabeçalho simplificado */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiMessageSquare className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chat da Comunidade</h2>
            </div>
            
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_MEMBER_LIST' })}
              className="md:hidden flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiUsers className="mr-1" />
              <FiChevronDown className={`transition-transform ${state.isMemberListOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <TypingIndicator 
            typingUsers={state.typingUsers}
            onlineMembers={state.onlineMembers} 
          />
        </div>
        
        {/* Lista de mensagens */}
        <div className="flex-1 p-4 overflow-y-auto" ref={listRef}>
          {state.isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner 
                size='sm'
                withText
                text='Carregando mensagens...'
                inline
              />
            </div>
          ) : (
            <CommunityMessageList 
              messages={state.messages}
              currentUserId={user.userId}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onMessageRead={handleMessageRead}
              hasMore={state.hasMoreMessages}
              loadMore={() => loadMessages(state.messages.length)}
              isLoading={state.isLoading}
            />
          )}
        </div>
        
        {/* Input de mensagem */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
          <CommunityChatInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            placeholder="Envie uma mensagem para a comunidade..."
            disabled={!isConnected}
          />
          {!isConnected && (
            <div className="text-xs text-red-500 mt-1">
              Conectando ao chat...
            </div>
          )}
        </div>
      </div>
      
      {/* Painel lateral com membros online */}
      <div className={`${state.isMemberListOpen ? 'flex' : 'hidden'} md:flex w-80 flex-col bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-800`}>
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