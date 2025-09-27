import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import UserDropdown from "./UserDropdown";
import { useEffect, useState } from "react";
import { SearchIcon, Menu, Plus } from "lucide-react";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function Header({ toggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      setSearchQuery("")
    }
  }

  const handleCreateCourseClick = (e) => {
    if (user?.status === 'pending') {
      e.preventDefault();
      toast.info('Você não pode criar cursos enquanto seu perfil estiver em análise');
      navigate('/dashboard');
    }
  };

  return (
    <header className={`fixed lg:static top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
        : "bg-white dark:bg-gray-900 shadow-sm"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Botão do Menu Mobile */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1 text-gray-500 hover:text-custom-primary dark:hover:text-custom-primary"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-custom-primary rounded-md flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-white" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="hidden sm:block text-xl font-bold text-custom-primary">
                Donza
              </span>
            </Link>
          </div>

          {/* Barra de Pesquisa (centralizada) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={
                    user?.role === 'instructor' ? 'Buscar meus cursos, eventos...' :
                    user?.role === 'institution' ? 'Buscar eventos, participantes...' :
                    'Buscar cursos, instrutores...'
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-custom-primary text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Área de Conta e Tema */}
          <div className="flex items-center space-x-3">
            {/* Botão de Pesquisa Mobile */}
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-2 text-gray-500 bg-gray-50/20 rounded-md hover:text-custom-primary dark:text-custom-primary transition-colors"
            >
              {isMobileSearchOpen ? (
                <X className="h-5 w-5"/>
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
            </button>

            {/* Botão de Ação Rápida para Instrutores */}
            {isAuthenticated && user?.role === 'instructor' && (
              <Link
                to={user?.status === 'pending' ? '#' : '/instructor/courses/create'}
                onClick={handleCreateCourseClick}
                className={`hidden lg:flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  user?.status === 'pending'
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-custom-primary text-white hover:bg-custom-primary-hover'
                }`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Curso
                {user?.status === 'pending' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
                    Pendente
                  </span>
                )}
              </Link>
            )}

            <ThemeToggle />
            
            {isAuthenticated ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <div className="hidden sm:flex space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-custom-primary dark:hover:text-custom-primary transition-colors font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md bg-custom-primary text-white hover:bg-custom-primary-hover transition-colors shadow-sm font-medium"
                >
                  Cadastre-se
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Pesquisa Mobile */}
        {isMobileSearchOpen && (
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={
                    user?.role === 'instructor' ? 'Buscar meus cursos...' :
                    user?.role === 'institution' ? 'Buscar eventos...' :
                    'Buscar cursos...'
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-custom-primary text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}