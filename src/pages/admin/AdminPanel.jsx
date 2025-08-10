import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import PlatformLoader from '@/components/common/PlatformLoader';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import AdminCoursesTable from '@/components/admin/AdminCoursesTable';
import AdminEventsTable from '@/components/admin/AdminEventsTable';
import AdminHelpCenter from '@/pages/admin/AdminHelpCenter';
import AdminTestimonials from './AdminTestimonials';
import AdminFeedback from '@/pages/admin/AdminFeedback';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AccessDenied from '@/components/error/AccessDenied';
import AdminVerifications from './AdminVerifications';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    stats: null,
    recentActivities: [],
    systemStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [activitiesRes, systemRes] = await Promise.all([
          api.get('/admin/activities'),
          api.get('/admin/system-status')
        ]);

        setAdminData({
          recentActivities: activitiesRes.data,
          systemStatus: systemRes.data
        });
      } catch (err) {
        setError('Failed to load admin data');
        toast.error('Failed to load admin dashboard. Please try again later.');
        console.error('Admin panel error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (user?.role !== 'admin') {
    return <AccessDenied />;
  }

  if (loading) {
    return <PlatformLoader fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar atualizada com novas opções */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        extendedOptions={[
          { id: 'dashboard', label: 'Dashboard', icon: 'home' },
          { id: 'verifications', label: 'Verificações', icon: 'shield-check', badge: adminData.pendingVerifications },
          { id: 'users', label: 'Usuários', icon: 'users' },
          { id: 'courses', label: 'Cursos', icon: 'book-open' },
          { id: 'events', label: 'Eventos', icon: 'calendar' },
          { id: 'testimonials', label: 'Testemunhos', icon: 'message-square-text' },
          { id: 'helpcenter', label: 'Central de Ajuda', icon: 'help-circle' },
          { id: 'feedback', label: 'Feedback', icon: 'message-square' }
        ]}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={getTabTitle(activeTab)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Conteúdo das abas */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <AdminStats systemStatus={adminData.systemStatus} />
              <RecentActivities activities={adminData.recentActivities} />
            </div>
          )}
          
          {activeTab === 'verifications' && <AdminVerifications />}
          {activeTab === 'users' && <AdminUsersTable />}
          {activeTab === 'courses' && <AdminCoursesTable />}
          {activeTab === 'events' && <AdminEventsTable />}
          {activeTab === 'helpcenter' && <AdminHelpCenter />}
          {activeTab === 'testimonials' && <AdminTestimonials /> }
          {activeTab === 'feedback' && <AdminFeedback />}
        </main>
      </div>
    </div>
  );
}

// Componente auxiliar para atividades recentes
function RecentActivities({ activities }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Atividades Recentes
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                  <span className="text-indigo-600 dark:text-indigo-300">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Nenhuma atividade recente
          </div>
        )}
      </div>
    </div>
  );
}

// Funções auxiliares
function getTabTitle(tabId) {
  const titles = {
    dashboard: 'Visão Geral',
    users: 'Gestão de Usuários',
    courses: 'Gestão de Cursos',
    events: 'Gestão de Eventos',
    helpcenter: 'Central de Ajuda',
    system: 'Saúde do Sistema',
    feedback: 'Feedback dos Usuários'
  };
  return titles[tabId] || 'Painel Administrativo';
}

function getActivityIcon(activityType) {
  const icons = {};
  return icons[activityType] || icons.default;
}