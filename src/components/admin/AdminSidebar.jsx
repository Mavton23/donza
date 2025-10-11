import Icon from '@/components/common/Icon';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  extendedOptions, 
  sidebarOpen, 
  onToggleSidebar 
}) {
  const navigate = useNavigate();
  
  const options = extendedOptions || [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'verifications', label: 'Verificações', icon: 'shield-check' },
    { id: 'users', label: 'Usuários', icon: 'users' },
    { id: 'courses', label: 'Cursos', icon: 'book-open' },
    { id: 'events', label: 'Eventos', icon: 'calendar' },
    { id: 'testimonials', label: 'Testemunhos', icon: 'message-square-text' },
    { id: 'help', label: 'Ajuda', icon: 'help-circle' },
    { id: 'feedback', label: 'Feedback', icon: 'message-square' },
    { id: 'goout', label: 'Sair do painel', icon: 'log-out' }
  ];

  return (
    <>
      {/* Sidebar para desktop e mobile */}
      <div className={`
        fixed md:relative z-30
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex-shrink-0 h-full transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header do Sidebar */}
        <div className="p-4 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-custom-primary rounded-md flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-white" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-bold text-custom-primary">Donza</h1>
          </div>
          
          {/* Botão de fechar para mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Icon name="x" size="lg" />
          </button>
        </div>
        
        {/* Navegação */}
        <nav className="mt-6">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onTabChange(option.id)}
              className={`flex items-center px-4 py-3 w-full text-left transition-colors ${
                activeTab === option.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400 border-r-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Icon 
                name={option.icon} 
                className={`mr-3 ${
                  activeTab === option.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
                size="md" 
              />
              <span className="flex-1">{option.label}</span>
              
              {/* Badge para notificações */}
              {option.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 flex items-center justify-center">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}