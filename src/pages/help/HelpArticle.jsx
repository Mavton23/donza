import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, LifeBuoy, BookOpen, User, Video, 
  Settings, DollarSign, Users, Award, Building,
  Mail, MessageSquare, Star, Clock, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { decodeHtml } from '@/utils/decodeHtml';
import { fetchArticle, submitFeedback } from '@/services/help.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import HelpCard from './HelpCard';
import ContactSection from './ContactSection';

const HelpArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [wasHelpful, setWasHelpful] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const data = await fetchArticle(slug);
        setArticle(data.article);
        setRelatedArticles(data.relatedArticles);
      } catch (err) {
        setError('Artigo não encontrado');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const handleFeedback = async (helpful) => {
    try {
      await submitFeedback(article.articleId, helpful, comment);
      setWasHelpful(helpful);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h1>
        <Link
          to="/help"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Voltar para a Central de Ajuda
        </Link>
      </div>
    );
  }

  if (loading || !article) {
    return <LoadingSpinner fullScreen={false} />;
  }

  const categories = [
    { id: 'getting-started', name: 'Primeiros Passos', icon: <BookOpen size={18} /> },
    { id: 'account', name: 'Conta e Perfil', icon: <User size={18} /> },
    { id: 'courses', name: 'Cursos', icon: <Video size={18} /> },
    { id: 'community', name: 'Comunidades', icon: <Users size={18} /> },
    { id: 'certificates', name: 'Certificados', icon: <Award size={18} /> },
    { id: 'payments', name: 'Pagamentos', icon: <DollarSign size={18} /> },
    { id: 'technical', name: 'Problemas Técnicos', icon: <Settings size={18} /> },
    { id: 'institutions', name: 'Para Instituições', icon: <Building size={18} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6"
          >
            <ChevronLeft size={18} className="mr-2" />
            Voltar
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categorias</h2>
            <nav className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/help/${category.id}`}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    article.category === category.id
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo do artigo */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-4 gap-2">
                <span className="capitalize">{article.category}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  Atualizado em {new Date(article.updatedAt).toLocaleDateString('pt-BR')}
                </span>
                {article.rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                      <Star size={14} className="mr-1 fill-current" />
                      {article.rating.toFixed(1)} ({article.feedbackCount} avaliações)
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{article.title}</h1>
              
              <div 
                className="prose dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: decodeHtml(article.content) }} 
              />
              
              {/* Feedback section */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {feedbackSubmitted ? (
                    wasHelpful ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center">
                        <ThumbsUp size={20} className="mr-2 fill-current" />
                        Obrigado pelo seu feedback!
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center">
                        <ThumbsDown size={20} className="mr-2 fill-current" />
                        Sentimos muito por não ter ajudado.
                      </span>
                    )
                  ) : (
                    'Este artigo foi útil?'
                  )}
                </h3>
                
                {!feedbackSubmitted && (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => {
                          setWasHelpful(true);
                          setShowCommentField(true);
                        }}
                        className="flex items-center px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                      >
                        <ThumbsUp size={18} className="mr-2" />
                        Sim
                      </button>
                      <button 
                        onClick={() => {
                          setWasHelpful(false);
                          setShowCommentField(true);
                        }}
                        className="flex items-center px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                      >
                        <ThumbsDown size={18} className="mr-2" />
                        Não
                      </button>
                    </div>

                    {(showCommentField || comment) && (
                      <div className="space-y-2">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Comentário (opcional)
                        </label>
                        <textarea
                          id="comment"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nos conte como podemos melhorar..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleFeedback(wasHelpful)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Enviar feedback
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artigos relacionados */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artigos relacionados</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedArticles.map((related) => (
                  <HelpCard 
                    key={related.id} 
                    article={related} 
                    showCategory={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção de contato */}
          <ContactSection />
        </div>
      </div>
    </div>
  );
};

export default HelpArticle;