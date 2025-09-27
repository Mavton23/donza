import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { 
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  GraduationCap,
  BarChart2,
  Award,
  Video,
  FileText,
  ClipboardList,
  DollarSign,
  User2Icon,
  UserCog,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Search,
  Building2,
  LayoutDashboard,
  Compass,
  Bookmark,
  HelpCircle,
  LogOut,
  LibraryBigIcon
} from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import PlatformLoader from "./PlatformLoader";
import { Globe } from "lucide-react";
import { BellIcon } from "lucide-react";
import { UserCog2 } from "lucide-react";
import { SidebarBadge } from "../ui/sidebar-badge";
// import { useUnreadStatus } from "@/hooks/useUnreadStatus";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { user, loading: authLoading, logout } = useAuth();
  // const { 
  //   hasUnreadMessages, 
  //   hasUnreadNotifications, 
  //   unreadMessagesCount,
  //   unreadNotificationsCount
  // } = useUnreadStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname]);

  if (authLoading) return <PlatformLoader />;

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const translateRole = (role) => {
    const roles = {
      student: 'Estudante',
      instructor: 'Instrutor',
      admin: 'Administrador',
      institution: 'Instituição'
    };
    return roles[role] || role;
  };

  const isActive = (href, matchExact = false) => {
    return matchExact 
      ? location.pathname === href
      : location.pathname.startsWith(href);
  };

  // Definições de navegação
  const commonNav = [
    {
      name: "Buscar",
      href: "/search",
      icon: Search,
      matchExact: true
    },
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: Home,
      matchExact: true
    },
    { 
      name: "Descobrir Cursos", 
      href: "/courses", 
      icon: Compass,
      matchExact: true
    },
    { 
      name: "Eventos", 
      href: "/events", 
      icon: Calendar 
    },
    { 
      name: "Mensagens", 
      href: "/messages", 
      icon: MessageSquare,
      // badge: hasUnreadMessages ? true : null,
      // count: unreadMessagesCount
    },
    {
      name: "Notificações",
      href: "/notifications",
      icon: BellIcon,
      // badge: hasUnreadNotifications ? true : null,
      // count: unreadNotificationsCount
    },
    { 
      name: "Comunidades", 
      href: "/communities", 
      icon: Globe,
    },
    { 
      name: "Avaliações",
      href: "/reviews", 
      icon: GraduationCap 
    },
  ];

  const studentNav = [
    { 
      name: "Meu perfil", 
      href: "/profile", 
      icon: User2Icon 
    },
    { 
      name: "Aprendizado", 
      href: "/learning", 
      icon: BookOpen,
      submenu: [
        { name: "Meus Cursos", icon: Bookmark, href: "/learning/courses" },
        { name: "Progresso", icon: BarChart2, href: "/learning/progress" },
        { name: "Certificados", icon: Award, href: "/learning/certificates" }
      ]
    },
    {
      name: "Aulas",
      href: "/lessons",
      icon: LibraryBigIcon
    }
  ];

  const instructorNav = [
    { 
      name: "Meu perfil", 
      href: "/profile", 
      icon: User2Icon 
    },
    {
      name: "Instrutor",
      icon: UserCog,
      submenu: [
        { name: "Cursos", href: "/instructor/courses", icon: BookOpen },
        { name: "Aulas", href: "/instructor/lessons", icon: LibraryBigIcon },
        { name: "Atividades", href: "/instructor/assignments", icon: ClipboardList },
        { name: "Financeiro", href: "/instructor/earnings", icon: DollarSign },
      ]
    },
    { 
      name: "Relatórios", 
      href: "/analytics", 
      icon: BarChart2 
    },
  ];

  const institutionNav = [
    { 
      name: "Perfil", 
      href: "/profile", 
      icon: User2Icon 
    },
    {
      name: "Instituição",
      icon: Building2,
      submenu: [
        { 
          name: "Visão Geral", 
          href: "/institution", 
          icon: LayoutDashboard,
          badge: "Novo" 
        },
      ]
    }
  ];

  const adminNav = [
    {
      name: "Administração",
      icon: UserCog,
      submenu: [
        { name: "Painel", href: "/admin", icon: UserCog2 },
      ]
    }
  ];

  const settingsNav = [
    { 
      name: "Configurações", 
      href: "/settings", 
      icon: Settings 
    },
    { 
      name: "Ajuda", 
      href: "/help", 
      icon: HelpCircle 
    }
  ];

  const getNavItems = () => {
    let items = [...commonNav];
    
    if (user?.role === 'student') {
      items = [...items, ...studentNav];
    } else if (user?.role === 'instructor') {
      items = [...items, ...instructorNav];
    } else if (user?.role === 'institution'){
      items = [...items, ...institutionNav];
    } else if (user?.role === 'admin') {
      items = [...items, ...adminNav];
    }
    
    return [...items, ...settingsNav];
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-72 h-screen overflow-y-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col
      `}>
        {/* Cabeçalho do Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
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
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo de Navegação */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {getNavItems().map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors
                        ${expandedMenus[item.name] || item.submenu.some(sub => isActive(sub.href))
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5
                          ${expandedMenus[item.name] || item.submenu.some(sub => isActive(sub.href))
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-300'}`}
                      />
                      <span className="flex-1 text-left">{item.name}</span>
                      {expandedMenus[item.name] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {(expandedMenus[item.name] || item.submenu.some(sub => isActive(sub.href))) && (
                      <div className="ml-10 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) =>
                              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                              ${isActive
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-600 dark:text-indigo-300'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`
                            }
                          >
                            {subItem.icon && (
                              <subItem.icon
                                className={`mr-3 flex-shrink-0 h-4 w-4
                                  ${isActive(subItem.href)
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-indigo-300'}`}
                              />
                            )}
                            <span>{subItem.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive: navLinkIsActive }) =>
                      `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                      ${navLinkIsActive || isActive(item.href, item.matchExact)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`
                    }
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5
                        ${isActive(item.href, item.matchExact)
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-300'}`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <SidebarBadge 
                        hasUnread={item.badge}
                        count={item.count}
                      />
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Rodapé do Sidebar */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {user && (
            <div 
              className="flex items-center p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-sm transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/profile')}
            >
              <div className="relative flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-600 group-hover:ring-indigo-300 transition-all border border-custom-primary"
                  src={user.avatarUrl || '/images/placeholder.png'}
                  alt="User avatar"
                />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 capitalize flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-custom-primary mr-1"></span>
                  {translateRole(user.role)}
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          )}
          
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <ThemeToggle className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg" />
            
            <button
              onClick={logout}
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>

          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            <p>© {new Date().getFullYear()} Donza</p>
          </div>
        </div>
      </aside>
    </>
  );
}