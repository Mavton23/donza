import { useEffect, useRef, useCallback, useState } from 'react';

export const useWebSocket = ({ 
  groupId, 
  userId,
  token,
  onMessageReceived, 
  onTypingStatus, 
  onMembersUpdate,
  onMessageUpdated,
  onMessageDeleted,
  onUserStatusChange,
  onTopicChanged,
  onReconnect,
  onConnectionChange
}) => {
  const wsRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef([]);
  const reconnectTimeoutRef = useRef(null);
  const isMounted = useRef(true);
  const lastPongRef = useRef(Date.now());

  // Limpa a conexão existente
  const resetConnection = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Resetting connection');
      }
      
      wsRef.current = null;
    }
  }, []);

  // Envia mensagens da fila quando a conexão estiver pronta
  const flushMessageQueue = useCallback(() => {
    while (messageQueue.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      const message = messageQueue.current.shift();
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending queued message:', error);
        messageQueue.current.unshift(message);
        break;
      }
    }
  }, []);

  // Configura a conexão WebSocket
  const setupWebSocket = useCallback(() => {
    resetConnection();
    clearTimeout(reconnectTimeoutRef.current);

    if (!groupId || !userId || !token) {
      console.error('Missing required parameters for WebSocket connection');
      return;
    }

    const wsUrl = `ws://localhost:5000/ws/groups/${groupId}/${userId}?token=${encodeURIComponent(token)}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      if (!isMounted.current) return;
      
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      onConnectionChange?.(true);
      reconnectAttempts.current = 0;
      lastPongRef.current = Date.now();

      // Envia autenticação inicial
      send({
        type: 'AUTH',
        userId,
        groupId,
        token
      });

      // Envia mensagens na fila
      flushMessageQueue();

      // Configura ping para manter conexão ativa
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        const timeSinceLastPong = Date.now() - lastPongRef.current;
        if (timeSinceLastPong > 30000) {
          console.warn('No PONG received, reconnecting...');
          wsRef.current?.close(4008, 'No PONG received');
          return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ 
            type: 'PING',
            timestamp: Date.now()
          }));
        }
      }, 25000); // Ping a cada 25 segundos
    };

    wsRef.current.onmessage = (event) => {
      if (!isMounted.current) return;
      
      try {
        const data = JSON.parse(event.data);
        
        // Atualiza último PONG recebido
        if (data.type === 'PONG') {
          lastPongRef.current = Date.now();
          return;
        }

        // Trata diferentes tipos de mensagem
        switch (data.type) {
          case 'AUTH_SUCCESS':
            console.log('WebSocket authenticated successfully');
            break;
            
          case 'AUTH_ERROR':
            console.error('WebSocket authentication failed:', data.message);
            wsRef.current?.close(4003, 'Authentication failed');
            break;
            
          case 'TOPIC_CHANGED':
            onTopicChanged?.(data.topic);
            break;
            
          case 'NEW_MESSAGE':
            onMessageReceived?.(data.message);
            break;
            
          case 'MESSAGE_UPDATED':
            onMessageUpdated?.(data.message);
            break;
            
          case 'MESSAGE_DELETED':
            onMessageDeleted?.(data.messageId);
            break;
            
          case 'TYPING_STATUS':
            onTypingStatus?.(data.users);
            break;
            
          case 'USER_STATUS':
            onUserStatusChange?.(data.userId, data.isOnline);
            break;
            
          case 'MEMBERS_UPDATE':
            onMembersUpdate?.(data.members);
            break;
            
          case 'ERROR':
            console.error('WebSocket error:', data.message);
            break;
            
          case 'RECONNECT':
            console.log('Server requested reconnect');
            onReconnect?.();
            break;
            
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      if (!isMounted.current) return;
      
      console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
      setIsConnected(false);
      onConnectionChange?.(false);
      clearInterval(pingIntervalRef.current);
      
      // Códigos que não devem tentar reconectar
      const noReconnectCodes = [1000, 1001, 1005, 4003];
      
      if (!noReconnectCodes.includes(event.code) && isMounted.current) {
        const baseDelay = 1000;
        const maxDelay = 30000;
        const delay = Math.min(
          baseDelay * Math.pow(2, reconnectAttempts.current),
          maxDelay
        );
        
        console.log(`Attempting reconnect in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            reconnectAttempts.current++;
            setupWebSocket();
          }
        }, delay);
      }
    };

    wsRef.current.onerror = (error) => {
      if (!isMounted.current) return;
      console.error('WebSocket error:', error);
    };
  }, [
    groupId, 
    userId, 
    token,
    onMessageReceived, 
    onTypingStatus, 
    onMembersUpdate,
    onMessageUpdated,
    onMessageDeleted,
    onUserStatusChange,
    onTopicChanged,
    onReconnect,
    onConnectionChange,
    resetConnection,
    flushMessageQueue
  ]);

  // Envia mensagem ou coloca na fila se não estiver conectado
  const send = useCallback((data) => {
    if (!data || !data.type) {
      console.error('Invalid WebSocket message:', data);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        messageQueue.current.push(data);
      }
    } else {
      console.log('WebSocket not connected, queuing message:', data.type);
      messageQueue.current.push(data);
    }
  }, []);

  // Métodos específicos para enviar mensagens
  const sendMessage = useCallback((message) => {
    send({
      type: 'CHAT_MESSAGE',
      message: {
        ...message,
        senderId: userId,
        groupId,
        timestamp: new Date().toISOString()
      }
    });
  }, [send, groupId, userId]);

  const sendTypingStatus = useCallback((isTyping) => {
    send({
      type: 'TYPING_STATUS',
      isTyping,
      userId,
      groupId
    });
  }, [send, groupId, userId]);

  const markMessageAsRead = useCallback((messageId) => {
    send({
      type: 'MESSAGE_READ',
      messageId,
      userId,
      groupId
    });
  }, [send, groupId, userId]);

  const changeTopic = useCallback((newTopic) => {
    send({
      type: 'GROUP_TOPIC_CHANGE',
      topic: newTopic,
      userId,
      groupId
    });
  }, [send, groupId, userId]);

  useEffect(() => {
    isMounted.current = true;
    setupWebSocket();

    return () => {
      isMounted.current = false;
      clearInterval(pingIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      resetConnection();
    };
  }, [setupWebSocket, resetConnection]);

  return { 
    sendMessage, 
    sendTypingStatus,
    markMessageAsRead,
    changeTopic,
    isConnected,
    reconnect: setupWebSocket
  };
};