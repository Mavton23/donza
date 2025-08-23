import { User, Award, Bookmark, UserPlus } from "lucide-react";

export default function TabNavigation({ activeTab, setActiveTab, tabs = [] }) {
  const defaultTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'stats', label: 'Estatísticas', icon: Award },
    { id: 'activities', label: 'Atividades', icon: Bookmark },
    { id: 'connections', label: 'Conexões', icon: UserPlus }
  ];

  const availableTabs = tabs.length > 0 ? tabs : defaultTabs;

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto w-full">
        {availableTabs.map(tab => {
          const IconComponent = tab.icon;
          const isDisabled = tab.disabled;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium flex items-center relative
                ${activeTab === tab.id
                  ? 'border-b-2 border-custom-primary text-custom-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
                ${isDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:border-gray-300'
                }
                transition-colors duration-200
              `}
              disabled={isDisabled}
              title={isDisabled ? (tab.tooltip || 'Recurso temporariamente indisponível') : undefined}
              aria-disabled={isDisabled}
            >
              {IconComponent && (
                <IconComponent className={`h-4 w-4 mr-2 ${isDisabled ? 'text-gray-400' : ''}`} />
              )}
              <span className={isDisabled ? 'opacity-80' : ''}>
                {tab.label}
              </span>
              
              {isDisabled && (
                <span 
                  className="absolute -top-1 -right-1"
                  aria-label="Recurso pendente de aprovação"
                >
                  <svg 
                    className="h-3 w-3 text-yellow-500" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}