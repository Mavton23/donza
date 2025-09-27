import { useEffect, useRef, useCallback, useState } from 'react';

// Tipos de conexão suportados
export const WS_CONNECTION_TYPES = {
  CONVERSATION: 'conversation',
  GROUP: 'group', 
  COMMUNITY: 'community'
};

// Tipos de mensagem suportados
export const WS_MESSAGE_TYPES = {
  // Mensagens gerais
  PING: 'PING',
  PONG: 'PONG',
  AUTH: 'AUTH',
  ERROR: 'ERROR',
  RECONNECT: 'RECONNECT',
  ERROR: 'ERROR',
  
  // Mensagens de chat
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  NEW_MESSAGE: 'NEW_MESSAGE',
  MESSAGE_DELIVERED: 'MESSAGE_DELIVERED',
  MESSAGE_READ: 'MESSAGE_READ',
  MESSAGE_UPDATED: 'MESSAGE_UPDATED',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  
  // Status de usuário
  TYPING_STATUS: 'TYPING_STATUS',
  TYPING_UPDATE: 'TYPING_UPDATE',
  USER_STATUS_UPDATE: 'USER_STATUS_UPDATE',
  
  // Grupos específicos
  TOPIC_CHANGED: 'TOPIC_CHANGED',
  GROUP_TOPIC_CHANGE: 'GROUP_TOPIC_CHANGE',
  
  // Comunidades específicas
  COMMUNITY_ANNOUNCEMENT: 'COMMUNITY_ANNOUNCEMENT',
  MODERATION_UPDATE: 'MODERATION_UPDATE',
  MODERATION_ACTION: 'MODERATION_ACTION',
  MODERATION_UPDATE: 'MODERATION_UPDATE'
};

export const useWebSocket = ({ 
  connectionType,
  entityId,
  token,
  onMessage,
  onStatusChange,
  onError
}) => {
  const wsRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef([]);
  const isMounted = useRef(true);
  const lastPongRef = useRef(Date.now());

  // Validação dos parâmetros
  const isValidConnection = useCallback(() => {
    if (!connectionType || !Object.values(WS_CONNECTION_TYPES).includes(connectionType)) {
      console.error('Invalid connection type:', connectionType);
      return false;
    }
    
    if (!entityId) {
      console.error('Entity ID is required');
      return false;
    }
    
    if (!token) {
      console.error('Token is required');
      return false;
    }
    
    return true;
  }, [connectionType, entityId, token]);

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
    
    clearInterval(pingIntervalRef.current);
    clearTimeout(reconnectTimeoutRef.current);
  }, []);

  // Envia mensagens da fila
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

  // Configura ping para manter conexão
  const setupPingInterval = useCallback(() => {
    clearInterval(pingIntervalRef.current);
    
    pingIntervalRef.current = setInterval(() => {
      const timeSinceLastPong = Date.now() - lastPongRef.current;
      
      // Reconecta se não receber PONG por 30 segundos
      if (timeSinceLastPong > 30000) {
        console.warn('No PONG received, reconnecting...');
        resetConnection();
        return;
      }

      // Envia PING se conectado
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({
          type: WS_MESSAGE_TYPES.PING,
          timestamp: Date.now()
        });
      }
    }, 25000); // Ping a cada 25 segundos
  }, [resetConnection]);

  // Handler genérico de mensagens
  const handleMessage = useCallback((data) => {
    if (!data || !data.type) {
      console.warn('Received message without type:', data);
      return;
    }

    // Atualiza último PONG
    if (data.type === WS_MESSAGE_TYPES.PONG) {
      lastPongRef.current = Date.now();
      return;
    }

    // Dispara evento genérico
    onMessage?.(data);

    // Handlers específicos por tipo
    switch (data.type) {
      case WS_MESSAGE_TYPES.CONNECTION_ESTABLISHED:
        setIsConnected(true);
        onStatusChange?.('connected', data);
        break;
        
      case WS_MESSAGE_TYPES.CONNECTION_ERROR:
        console.error('Connection error:', data.message);
        onError?.(data.message);
        break;
        
      case WS_MESSAGE_TYPES.ERROR:
        console.error('WebSocket error:', data.message);
        onError?.(data.message);
        break;
        
    }
  }, [onMessage, onStatusChange, onError]);

  // Configura a conexão WebSocket
  const connect = useCallback(() => {
    if (!isValidConnection()) return;

    if (wsRef.current && 
      (wsRef.current.readyState === WebSocket.OPEN || 
        wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log("WebSocket já conectado ou conectando, não recriando.");
      return;
    }

    resetConnection();
    clearTimeout(reconnectTimeoutRef.current);

    const getWebSocketPath = (type) => {
      const paths = {
        conversation: 'conversations',
        group: 'groups', 
        community: 'communities'
      };
      return paths[type] || type;
    };

    const wsUrl = `${import.meta.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/ws/${getWebSocketPath(connectionType)}/${entityId}?token=${token}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (!isMounted.current) return;
        
        console.log('WebSocket connected successfully');
        lastPongRef.current = Date.now();
        setupPingInterval();
        flushMessageQueue();
        setIsConnected(true);
        onStatusChange?.('connected');
      };

      wsRef.current.onmessage = (event) => {
        if (!isMounted.current) return;
        
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError?.(error.message);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!isMounted.current) return;
        
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        onStatusChange?.('disconnected', event);
        
        // Códigos que não devem tentar reconectar
        const noReconnectCodes = [1000, 1001, 1005, 4003, 4008];
        
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
              connect();
            }
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        if (!isMounted.current) return;
        console.error('WebSocket connection error:', error instanceof Error ? error.message : error);
        onError?.(error.message);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      onError?.(error.message);
    }
  }, [
    connectionType,
    entityId,
    token,
    isValidConnection,
    resetConnection,
    setupPingInterval,
    flushMessageQueue,
    handleMessage,
    onStatusChange,
    onError
  ]);

  // Envia mensagem ou coloca na fila
  const send = useCallback((data) => {
    if (!data || !data.type) {
      console.error('Invalid WebSocket message:', data);
      return false;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        messageQueue.current.push(data);
        return false;
      }
    } else {
      console.log('WebSocket not connected, queuing message:', data.type);
      messageQueue.current.push(data);
      return false;
    }
  }, []);

  // Métodos específicos para enviar mensagens
  const sendMessage = useCallback((content, options = {}) => {
    return send({
      type: WS_MESSAGE_TYPES.CHAT_MESSAGE,
      message: {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        ...options
      }
    });
  }, [send]);

  const sendTypingStatus = useCallback((isTyping) => {
    return send({
      type: WS_MESSAGE_TYPES.TYPING_STATUS,
      isTyping: isTyping
    });
  }, [send]);

  const markMessageAsRead = useCallback((messageId) => {
    return send({
      type: WS_MESSAGE_TYPES.MESSAGE_READ,
      messageId
    });
  }, [send]);

  const changeTopic = useCallback((topic) => {
    if (connectionType !== WS_CONNECTION_TYPES.GROUP) {
      console.error('Topic change only available for groups');
      return false;
    }
    
    return send({
      type: WS_MESSAGE_TYPES.GROUP_TOPIC_CHANGE,
      topic: topic.trim()
    });
  }, [send, connectionType]);

  const sendAnnouncement = useCallback((content, options = {}) => {
    if (connectionType !== WS_CONNECTION_TYPES.COMMUNITY) {
      console.error('Announcements only available for communities');
      return false;
    }
    
    return send({
      type: WS_MESSAGE_TYPES.COMMUNITY_ANNOUNCEMENT,
      content: content.trim(),
      ...options
    });
  }, [send, connectionType]);

  // Efeito principal
  useEffect(() => {
    isMounted.current = true;

    if (isValidConnection()) {
      connect();
    }

    return () => {
      isMounted.current = false;
      resetConnection();
    };
  }, [connectionType, entityId, token]);

  return {
    // Estado
    isConnected,
    
    // Métodos de envio
    send,
    sendMessage,
    sendTypingStatus,
    markMessageAsRead,
    changeTopic,
    sendAnnouncement,
    
    // Controle de conexão
    connect,
    disconnect: resetConnection,
    
    // Informações
    connectionType,
    entityId
  };
};

// Hook de conveniência para cada tipo de conexão
export const useConversationWebSocket = (props) => 
  useWebSocket({ ...props, connectionType: WS_CONNECTION_TYPES.CONVERSATION });

export const useGroupWebSocket = (props) => 
  useWebSocket({ ...props, connectionType: WS_CONNECTION_TYPES.GROUP });

export const useCommunityWebSocket = (props) => 
  useWebSocket({ ...props, connectionType: WS_CONNECTION_TYPES.COMMUNITY });