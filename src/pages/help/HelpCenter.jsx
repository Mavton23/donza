import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, LifeBuoy, DollarSign, Mail, 
  BookOpen, Video, User, Settings, Users, Award, Building, Home,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { fetchHelpData, searchArticles } from '@/services/help.service';
import PlatformLoader from '@/components/common/PlatformLoader';
import HelpCard from './HelpCard';
import Icon from '@/components/common/Icon';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeCategory = location.pathname.split('/help/')[1] || 'getting-started';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { articles, popularTopics, categories } = await fetchHelpData();
        setArticles(articles);
        setPopularTopics(popularTopics);
        setCategories(categories);
      } catch (error) {
        console.error('Error loading help data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(null);
      return;
    }

    const search = async () => {
      try {
        const results = await searchArticles(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const timer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredArticles = articles.filter(article => 
    article.category === activeCategory &&
    (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const defaultCategories = [
    { id: 'getting-started', name: 'Primeiros Passos', icon: <BookOpen size={18} /> },
    { id: 'account', name: 'Conta e Perfil', icon: <User size={18} /> },
    { id: 'courses', name: 'Cursos', icon: <Video size={18} /> },
    { id: 'community', name: 'Comunidades', icon: <Users size={18} /> },
    { id: 'certificates', name: 'Certificados', icon: <Award size={18} /> },
    { id: 'payments', name: 'Pagamentos', icon: <DollarSign size={18} /> },
    { id: 'technical', name: 'Problemas Técnicos', icon: <Settings size={18} /> },
    { id: 'institutions', name: 'Para Instituições', icon: <Building size={18} /> }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-full p-3 mb-4">
          <LifeBuoy size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Central de Ajuda</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Encontre respostas para suas dúvidas ou entre em contato com nosso suporte
        </p>
        
        {/* Barra de pesquisa */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar na ajuda (ex: 'como resetar senha', 'certificados')..."
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <PlatformLoader fullScreen={true} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
              <div className="mb-2">
                <Link 
                  to="/" 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
                >
                  <Home size={18} className="mr-2" />
                  Voltar para a plataforma
                </Link>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categorias</h2>
              <nav className="space-y-1">
                {displayCategories.map((category) => (
                  <div key={`category-${category.id}`} className="mb-1">
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                        activeCategory === category.id
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3"><Icon name={category.icon} /></span>
                        {category.name}
                      </div>
                      {expandedCategory === category.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>

                    {expandedCategory === category.id && (
                      <div className="ml-8 mt-1 space-y-1">
                        {articles
                          .filter(a => a.category === category.id)
                          .slice(0, 5)
                          .map(article => (
                            <Link
                              key={`${category.id}-${article.articleId}`}
                              to={`/help/article/${article.slug}`}
                              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {article.title}
                            </Link>
                          ))}
                        <Link
                          to={`/help/${category.id}`}
                          className="block px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                        >
                          Ver todos
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Tópicos populares */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Tópicos Populares
                </h3>
                <div className="space-y-3">
                  {popularTopics.map((topic) => (
                    <Link
                      key={`popular-${topic.articleId}`}
                      to={`/help/article/${topic.slug}`}
                      className="flex items-start text-sm text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      <span className="mr-2 mt-0.5">•</span>
                      <span>{topic.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {searchQuery && searchResults ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Resultados para "{searchQuery}"
                </h2>
                
                {searchResults.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum resultado encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Não encontramos artigos correspondentes à sua pesquisa.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Limpar pesquisa
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {searchResults.map((result) => (
                      <HelpCard 
                        key={`search-${result.articleId}`}
                        article={result} 
                        showCategory={true} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayCategories.find(c => c.id === activeCategory)?.name || 'Artigos'}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredArticles.length} artigos disponíveis
                    </span>
                  </div>
                  
                  {filteredArticles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhum artigo nesta categoria
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Nossa equipe está trabalhando para adicionar mais conteúdo aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredArticles.map((article) => (
                        <HelpCard key={`article-${article.articleId}`} article={article} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Seção de contato */}
                <ContactSection />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ContactSection = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ainda precisa de ajuda?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida ou problema técnico.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/contact"
            className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full p-3 mr-4">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Enviar e-mail</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Respondemos em até 24h</p>
              <span className="text-xs text-indigo-600 dark:text-indigo-400">Recomendado para dúvidas complexas</span>
            </div>
          </Link>
          
          {/* <Link
            to="/live-chat"
            className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full p-3 mr-4">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Chat ao vivo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Disponível das 8h às 18h</p>
              <span className="text-xs text-green-600 dark:text-green-400">Resposta imediata</span>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;