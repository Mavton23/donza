import { useAuth } from '@/contexts/AuthContext';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import ThemeToggle from "../common/ThemeToggle";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Painel Administrativo</h1>
          <p className="mt-1 text-indigo-900 dark:text-indigo-200">
            Bem-vindo, {user.username || user.email}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Dropdown
            trigger={
              <div className="flex items-center cursor-pointer">
                <Avatar user={user} size="sm" className="mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.username}
                </span>
              </div>
            }
            items={[
              { label: 'Your Profile', action: () => console.log('Profile') },
              { label: 'Settings', action: () => console.log('Settings') },
              { label: 'Logout', action: logout }
            ]}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}