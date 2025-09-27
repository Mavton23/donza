import {
    UserIcon,
    LockIcon,
    BellIcon,
    SunIcon,
    CreditCardIcon
  } from "lucide-react";
  
  export default function SettingsSidebar({ activeTab, onTabChange }) {
    const tabs = [
      { id: 'account', name: 'Conta', icon: UserIcon },
      { id: 'security', name: 'Segurança', icon: LockIcon  },
      { id: 'notifications', name: 'Notificações', icon: BellIcon },
      { id: 'appearance', name: 'Aparência', icon: SunIcon },
      { id: 'billing', name: 'Pagamentos', icon: CreditCardIcon },
    ];
  
    return (
      <div className="w-full md:w-64">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Configurações</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'bg-custom-primary/30 text-indigo-700 dark:bg-custom-primary/30 dark:text-indigo-100'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <Icon className="flex-shrink-0 h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }