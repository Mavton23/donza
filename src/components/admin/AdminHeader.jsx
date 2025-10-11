import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from "../common/ThemeToggle";
import UserDropdown from '../common/UserDropdown';
import Icon from '../common/Icon';

export default function AdminHeader({ title, onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative">
      {/* Botão do menu absolute para mobile */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
        aria-label="Abrir menu"
      >
        <Icon name="menu" size="lg" />
      </button>
      
      <div className="flex justify-between items-center px-4 md:px-6 py-4">
        {/* Lado esquerdo - Título e saudação */}
        <div className="flex flex-col md:flex-row md:items-end min-w-0 flex-1">
          <div className="text-center md:text-left pl-8 md:pl-0 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-200 truncate">
              {title || 'Painel Administrativo'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-indigo-600 dark:text-indigo-400 truncate">
              Bem-vindo, {user.username || user.email}
            </p>
          </div>
        </div>
        
        {/* Lado direito - Ações do usuário */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          <div className="hidden xs:block">
            <ThemeToggle />
          </div>
          <UserDropdown user={user} logout={logout} />
        </div>
      </div>

      {/* ThemeToggle */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 shadow-sm">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}