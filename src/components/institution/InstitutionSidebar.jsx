import { NavLink } from 'react-router-dom';
import { Award, BookOpen, Users, UserCircle2, BarChart2, CreditCard, LayoutDashboard, Settings } from 'lucide-react';

export default function InstitutionSidebar({ activeTab, institution }) {
  const tabs = [
    { id: 'dashboard', name: 'Visão Geral', icon: LayoutDashboard, href: 'dashboard' },
    { id: 'courses', name: 'Cursos', icon: BookOpen, href: 'courses' },
    { id: 'instructors', name: 'Instrutores', icon: Users, href: 'instructors' },
    { id: 'analytics', name: 'Relatórios', icon: BarChart2, href: 'analytics' },
    { id: 'certificates', name: 'Certificados', icon: Award, href: 'certificates' },
    { id: 'billing', name: 'Financeiro', icon: CreditCard, href: 'billing' },
    { id: 'settings', name: 'Configurações Institucionais', icon: Settings, href: 'settings' },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-screen sticky top-0">
        {/* Cabeçalho da Instituição */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-gray-200 dark:border-gray-700">
          {institution?.logo ? (
            <img src={institution.logo} alt={`${institution.name} logo`} className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {institution?.name.charAt(0)}
            </div>
          )}
          <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white truncate">
            {institution?.name || 'Institution'}
          </h1>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.href}
              end={tab.href === ''}
              className={({ isActive }) => 
                `group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`
              }
            >
              <tab.icon
                className={`mr-3 h-5 w-5 ${
                  activeTab === tab.id
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}