import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { Bell, HelpCircle, Search } from 'lucide-react';
import UserDropdown from '../../components/common/UserDropdown';
import InstitutionSwitcher from './InstitutionSwitcher';

export default function InstitutionHeader({ institution, user }) {
  return (
    <header className="sticky top-0 z-10 py-4"> {/* Alterado para sticky e ajustado padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16"> {/* Altura fixa */}
          {/* Left section */}
          <div className="flex items-center">
            <Link to="/institution/dashboard" className="flex items-center">
              {institution?.logo ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={institution.logo}
                  alt={`${institution.name} logo`}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold">
                  {institution?.name.charAt(0)}
                </div>
              )}
              <span className="ml-2 text-white font-semibold text-lg hidden md:block truncate max-w-xs">
                {institution?.name || 'Institution Dashboard'}
              </span>
            </Link>
            
            {user?.institutions?.length > 1 && (
              <div className="ml-4">
                <InstitutionSwitcher 
                  currentInstitution={institution} 
                  institutions={user.institutions} 
                />
              </div>
            )}
          </div>

          {/* Center section */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-200" />
              </div>
              <input
                type="search"
                placeholder="Search courses, students..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-transparent rounded-md leading-5 bg-blue-500 bg-opacity-30 text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:placeholder-gray-500 focus:text-gray-900 transition-colors"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none">
              <span className="sr-only">Notifications</span>
              <div className="relative">
                <Bell className="h-5 w-5" />
                {user?.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {user.unreadNotifications > 9 ? '9+' : user.unreadNotifications}
                  </span>
                )}
              </div>
            </button>

            <div className="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none">
              <span className="sr-only">Theme</span>
              <ThemeToggle />
            </div>

            <div className="ml-2">
              <UserDropdown 
                user={user} 
                institution={institution}
                menuItems={[
                  { label: 'Your Profile', href: '/profile' },
                  { label: 'Institution Settings', href: '/institution/settings' },
                  { label: 'Switch to Personal View', href: '/dashboard' },
                  { label: 'Sign out', href: '/logout' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-200" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-transparent rounded-md leading-5 bg-blue-500 bg-opacity-30 text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:placeholder-gray-500 focus:text-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
}