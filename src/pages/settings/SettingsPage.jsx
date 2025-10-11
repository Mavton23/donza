import usePageTitle from "@/hooks/usePageTitle";
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SettingsPage() {
  usePageTitle();
  const { currentUser, updateUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar 
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              navigate(`/settings/${tab}`);
            }}
          />
          
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <Outlet context={{ 
                user: currentUser,
                role: currentUser.role,
                updateUser: updateUser
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}