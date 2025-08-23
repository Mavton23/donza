import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router-dom";

export default function UserDropdown({ user, logout }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none">
          <div className="flex items-center">
            <img
              className="h-8 w-8 mr-2 rounded-full ring-2 ring-white dark:ring-gray-600 group-hover:ring-indigo-300 transition-all border border-custom-primary"
              src={user.avatarUrl || '/images/placeholder.png'}
              alt="User profile"
            />
            <span className="hidden md:inline">{user.username}</span>
            <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                  Perfil
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                  Minhas configurações
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                  Sair
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}