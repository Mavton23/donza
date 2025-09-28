import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export function useUnreadStatus() {
  const { user } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHasUnreadMessages(false);
      setHasUnreadNotifications(false);
      setUnreadMessagesCount(0);
      setUnreadNotificationsCount(0);
      return;
    }

    const checkUnreadStatus = async () => {
      try {
        setLoading(true);
        
        // Faz as requisições em paralelo
        const [messagesResponse, notificationsResponse] = await Promise.allSettled([
          api.get('/conversation/has-unread'),
          api.get('/notifications/has-unread')
        ]);

        if (messagesResponse.status === 'fulfilled') {
          setHasUnreadMessages(messagesResponse.value.data.hasUnread);
          setUnreadMessagesCount(messagesResponse.value.data.count || 0);
        }

        if (notificationsResponse.status === 'fulfilled') {
          setHasUnreadNotifications(notificationsResponse.value.data.hasUnread);
          setUnreadNotificationsCount(notificationsResponse.value.data.count || 0);
        }

        // Trata erros individualmente sem quebrar a aplicação
        if (messagesResponse.status === 'rejected') {
          console.error('Error checking unread messages:', messagesResponse.reason);
        }

        if (notificationsResponse.status === 'rejected') {
          console.error('Error checking unread notifications:', notificationsResponse.reason);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error in useUnreadStatus:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUnreadStatus();

    const interval = setInterval(checkUnreadStatus, 180000);

    return () => clearInterval(interval);
  }, [user, forceUpdate]);

  const forceRefresh = () => setForceUpdate(prev => prev + 1);  

  return {
    hasUnreadMessages,
    hasUnreadNotifications,
    unreadMessagesCount,
    unreadNotificationsCount,
    loading,
    error,
    forceRefresh
  };
}