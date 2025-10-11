import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TabNavigation from '@/components/profile/TabNavigation';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { BellIcon, EyeIcon, EyeOffIcon, SettingsIcon, MailIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente principal
export default function NotificationsPage() {
  usePageTitle();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    notifications: [],
    preferences: null,
    loading: true,
    error: null,
    activeTab: 'unread',
    bulkAction: false,
    processingIds: new Set()
  });

  const unreadCount = state.notifications.filter(n => !n.readAt).length;

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [notificationsRes, preferencesRes] = await Promise.all([
        api.get('/notifications/notifications'),
        api.get('/notifications/notifications/preferences')
      ]);

      setState(prev => ({
        ...prev,
        notifications: notificationsRes.data.data,
        preferences: preferencesRes.data,
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || 'Falha ao carregar notificações',
        loading: false
      }));
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notificações',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Marcar como lida
  const handleMarkAsRead = async (notificationId) => {
    try {
      setState(prev => ({
        ...prev,
        processingIds: new Set(prev.processingIds).add(notificationId)
      }));

      await api.patch(`/notifications/notifications/${notificationId}/read`);

      setState(prev => {
        const updatedNotifications = prev.notifications.map(n => 
          n.notificationId === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        );
        
        return {
          ...prev,
          notifications: updatedNotifications,
          processingIds: new Set([...prev.processingIds].filter(id => id !== notificationId))
        };
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao marcar como lida');
      setState(prev => ({
        ...prev,
        processingIds: new Set([...prev.processingIds].filter(id => id !== notificationId))
      }));
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      setState(prev => ({ ...prev, bulkAction: true }));
      
      await api.patch('/notifications/notifications/read-all');
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
        ),
        bulkAction: false
      }));
      
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao marcar todas como lidas');
      setState(prev => ({ ...prev, bulkAction: false }));
    }
  };

  const handleUpdatePreferences = async (updatedPrefs) => {
    try {
      await api.put('/notifications/notifications/preferences', updatedPrefs);
      setState(prev => ({ ...prev, preferences: updatedPrefs }));
      toast.success('Preferências atualizadas com sucesso');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar preferências');
    }
  };

  const filteredNotifications = useMemo(() => {
    switch (state.activeTab) {
      case 'unread':
        return state.notifications.filter(n => !n.readAt);
      case 'read':
        return state.notifications.filter(n => n.readAt);
      default:
        return state.notifications;
    }
  }, [state.notifications, state.activeTab]);

  // Componente de item de notificação
  const NotificationItem = ({ notification }) => (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`px-4 py-4 sm:px-6 ${!notification.readAt ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${!notification.readAt ? 'text-blue-800' : 'text-gray-600'} truncate`}>
          {notification.title}
        </p>
        {!notification.readAt && (
          <button
            onClick={() => handleMarkAsRead(notification.notificationId)}
            disabled={state.processingIds.has(notification.notificationId)}
            className="ml-2 flex-shrink-0 flex"
            title="Marcar como lida"
          >
            {state.processingIds.has(notification.notificationId) ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-blue-500 hover:text-blue-700" />
            )}
          </button>
        )}
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            {notification.message}
          </p>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <p>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>
      {notification.link && (
        <div className="mt-2">
          <a 
            href={notification.link}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Ver detalhes →
          </a>
        </div>
      )}
    </motion.li>
  );

  if (state.loading) return <LoadingSpinner fullScreen />;
  if (state.error) return <ErrorState message={state.error} onRetry={fetchData} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        {unreadCount > 0 && state.activeTab !== 'preferences' && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={state.bulkAction}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-custom-primary hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {state.bulkAction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Marcar todas como lidas'
            )}
          </button>
        )}
      </div>

      <TabNavigation
        activeTab={state.activeTab}
        setActiveTab={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
        tabs={[
          { id: 'all', label: 'Todas', icon: BellIcon },
          { id: 'unread', label: 'Não lidas', icon: EyeOffIcon, badge: unreadCount },
          { id: 'read', label: 'Lidas', icon: EyeIcon },
          { id: 'preferences', label: 'Preferências', icon: SettingsIcon }
        ]}
      />

      <div className="mt-6">
        {state.activeTab === 'preferences' ? (
          <NotificationPreferences 
            preferences={state.preferences}
            onUpdate={handleUpdatePreferences}
          />
        ) : (
          <>
            {filteredNotifications.length === 0 ? (
              <EmptyState 
                icon={MailIcon}
                title={`Nenhuma notificação ${state.activeTab === 'unread' ? 'não lida' : state.activeTab === 'read' ? 'lida' : ''}`}
                description={state.activeTab === 'unread' ? 
                  "Você não tem notificações não lidas" : 
                  "Suas notificações aparecerão aqui"}
              />
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => (
                      <NotificationItem key={notification.notificationId} notification={notification} />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}