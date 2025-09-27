import { useAuth } from '@/contexts/AuthContext';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import ThemeToggle from "../common/ThemeToggle";
import UserDropdown from '../common/UserDropdown';

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
          <UserDropdown user={user} logout={logout} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}