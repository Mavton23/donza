import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/services/api'
import InstitutionSidebar from './InstitutionSidebar';
import InstitutionHeader from './InstitutionHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import AccessDenied from '../error/AccessDenied';

export default function InstitutionLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentTab = pathSegments[pathSegments.length - 1] || 'dashboard';
    setActiveTab(currentTab);
  }, [location]);

  useEffect(() => {
    if (user?.institutionId) {
      const fetchInstitution = async () => {
        try {
          const response = await api.get(`/institutions/${user.institutionId}`);
          setInstitution(response.data);
        } catch (error) {
          console.error('Failed to load institution data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchInstitution();
    }
  }, [user]);

  if (user?.role !== 'institution') {
    return <AccessDenied />;
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <InstitutionSidebar activeTab={activeTab} institution={institution} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho com gradiente - removido o pb-32 que causava espaço excessivo */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900"
          style={institution?.branding ? {
            background: `linear-gradient(to right, ${institution.branding.primaryColor}, ${institution.branding.secondaryColor})`
          } : {}}
        >
          <InstitutionHeader institution={institution} user={user} />
        </div>

        {/* Área de conteúdo principal - ajustado o padding e removido margin-top negativa */}
        <main className="flex-1 overflow-y-auto pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Outlet context={{ institution }} />
          </div>
        </main>
      </div>
    </div>
  );
}