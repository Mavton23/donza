import Icon from '@/components/common/Icon';

export default function AdminSidebar({ activeTab, onTabChange, extendedOptions }) {
  const options = extendedOptions || [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'verifications', label: 'Verificações', icon: 'shield-check', badge: adminData.pendingVerifications },
    { id: 'users', label: 'Usuários', icon: 'users' },
    { id: 'courses', label: 'Cursos', icon: 'book-open' },
    { id: 'events', label: 'Eventos', icon: 'calendar' },
    { id: 'testimonials', label: 'Testemunhos', icon: 'message-square-text' },
    { id: 'help', label: 'Ajuda', icon: 'help-circle' },
    { id: 'feedback', label: 'Feedback', icon: 'message-square' }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="p-4">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center">
            <Icon name="home" className="text-white" size="lg" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-800 dark:text-white">Donza</h1>
        </div>
      </div>
      <nav className="mt-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onTabChange(option.id)}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activeTab === option.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
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
            {option.label}
          </button>
        ))}
      </nav>
    </div>
  );
}