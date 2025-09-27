import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import VideoPlayer from '@/components/lessons/VideoPlayer';
import AudioPlayer from '@/components/lessons/AudioPlayer';
import PdfViewer from '@/components/lessons/PdfViewer';
import LessonResources from '@/components/lessons/LessonResources';
import LessonActions from '@/components/lessons/LessonActions';
import LessonProgress from '@/components/lessons/LessonProgress';
import { 
  Play, 
  FileText, 
  Download, 
  ArrowLeft, 
  Clock, 
  User, 
  Star,
  BookOpen,
  AlertCircle,
  Lock
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';

export default function LessonDetail() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons/independent/${lessonId}`);
        setLesson(response.data.data);
        
        // Buscar progresso do usuário se estiver logado
        if (user) {
          try {
            const progressResponse = await api.get(`/lessons/user-progress/lesson/${lessonId}`);
            setProgress(progressResponse.data.progress || 0);
          } catch (progressError) {
            console.log('Progresso não encontrado ou erro ao buscar progresso');
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar aula');
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, user]);

  const handleProgressUpdate = async (newProgress) => {
    if (!user) return;
    
    try {
      await api.post(`/lessons/user-progress/lesson/${lessonId}`, {
        progress: newProgress,
        completed: newProgress >= 95 // Considera completo com 95%+ de progresso
      });
      setProgress(newProgress);
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
    }
  };

  const translateLevel = (level) => {
    const levelMap = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
  
    return levelMap[level] || level;
  };

  const handlePurchase = async () => {
    try {
      // Lógica para comprar aula individual (se aplicável)
      // Esta função seria chamada apenas para aulas pagas
      console.log('Iniciar processo de compra para aula:', lessonId);
      
      // Em uma implementação real, isso redirecionaria para uma página de checkout
      // ou abriria um modal de pagamento
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar compra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner fullScreen={true} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Erro ao carregar aula"
        message={error}
        action={
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Voltar
          </button>
        }
      />
    );
  }

  if (!lesson) {
    return (
      <ErrorState 
        title="Aula não encontrada"
        message="A aula que você está procurando não existe ou foi removida."
        action={
          <Link
            to="/lessons"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Explorar Aulas
          </Link>
        }
      />
    );
  }

  // Verificar acesso à aula
  // - Aulas gratuitas: acesso liberado para todos
  // - Aulas pagas: requer que o usuário esteja logado
  // - Admin: acesso total
  const canAccess = lesson.isFree || user || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {lesson.duration} minutos
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {lesson.lessonType}
                  </span>
                  {lesson.level && (
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                      {translateLevel(lesson.level)}
                    </span>
                  )}
                  {!lesson.isFree && (
                    <span className="flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      <Lock className="w-3 h-3 mr-1" />
                      Pago
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {lesson.averageRating && (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 font-medium">{lesson.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({lesson.ratingCount || 0})
                  </span>
                </div>
              )}
              
              <LessonActions 
                lesson={lesson}
                onPurchase={handlePurchase}
                canAccess={canAccess}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player/Visualizador Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Aviso de acesso restrito */}
              {!canAccess && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Acesso Restrito
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                    {!user 
                      ? 'Faça login para acessar esta aula.'
                      : 'Esta aula é paga. Adquira-a para ter acesso completo.'
                    }
                  </p>
                  {!user ? (
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Fazer Login
                    </Link>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Adquirir por {lesson.price}
                    </button>
                  )}
                </div>
              )}

              {/* Conteúdo da aula */}
              {canAccess && (
                <>
                  {lesson.lessonType === 'video' && lesson.mediaUrl && (
                    <VideoPlayer
                      src={lesson.mediaUrl}
                      title={lesson.title}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  )}
                  
                  {lesson.lessonType === 'audio' && lesson.mediaUrl && (
                    <AudioPlayer
                      src={lesson.mediaUrl}
                      title={lesson.title}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  )}
                  
                  {lesson.lessonType === 'pdf' && lesson.mediaUrl && (
                    <PdfViewer
                      src={lesson.mediaUrl}
                      title={lesson.title}
                    />
                  )}
                  
                  {lesson.lessonType === 'text' && (
                    <div className="p-6">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div 
                          dangerouslySetInnerHTML={{ __html: lesson.content }} 
                          className="lesson-content"
                        />
                      </div>
                    </div>
                  )}
                  
                  {(lesson.lessonType === 'quiz' || lesson.lessonType === 'assignment') && (
                    <div className="p-6 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {lesson.lessonType === 'quiz' ? 'Questionário' : 'Atividade'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {lesson.lessonType === 'quiz' 
                          ? 'Esta aula contém um questionário para testar seus conhecimentos.'
                          : 'Esta aula contém uma atividade prática para você desenvolver.'
                        }
                      </p>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Iniciar {lesson.lessonType === 'quiz' ? 'Questionário' : 'Atividade'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Progresso (apenas para usuários logados) */}
            {user && (
              <LessonProgress
                progress={progress}
                onProgressUpdate={handleProgressUpdate}
              />
            )}

            {/* Descrição e Detalhes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Sobre esta aula
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: lesson.description || lesson.content?.substring(0, 200) + '...' }}
                />
              </div>

              {/* Metadados */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrutor</h3>
                  <div className="flex items-center mt-1">
                    <Avatar
                      user={lesson.creator}
                      size='lg'
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-gray-900 dark:text-white">
                      {lesson.creator?.fullName}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Publicado em</h3>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nível</h3>
                  <p className="text-gray-900 dark:text-white mt-1 capitalize">
                    {translateLevel(lesson.level)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duração</h3>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {lesson.duration} minutos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recursos da Aula */}
            <LessonResources
              lesson={lesson}
              canAccess={canAccess}
            />

            {/* Aulas Relacionadas (apenas se for aula de um módulo) */}
            {lesson.moduleId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Outras aulas deste módulo
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Play className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Introdução ao Tópico
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">15 min</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">✓</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Play className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Conceitos Avançados
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">25 min</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Visualizações</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {lesson.viewCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avaliações</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {lesson.ratingCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Taxa de conclusão</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {lesson.completionRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}