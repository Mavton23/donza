import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { FileEdit, CheckCircle, Archive, Clock, Play, FileText, HelpCircle, Headphones, Book } from 'lucide-react';
import BuyButton from '@/components/payment/BuyButton';
import { CONTENT_TYPES } from '@/constants/contentTypes';

export default function LessonCard({ 
  lesson, 
  showInstructorActions = false,
  variant = 'default'
}) {
  // Mapeamento de status para cores e ícones
  const statusConfig = {
    draft: {
      text: 'Rascunho',
      icon: <FileEdit className="w-4 h-4" />,
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-800 dark:text-yellow-200'
    },
    published: {
      text: 'Publicado',
      icon: <CheckCircle className="w-4 h-4" />,
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-800 dark:text-green-200'
    },
    archived: {
      text: 'Arquivado',
      icon: <Archive className="w-4 h-4" />,
      bgClass: 'bg-gray-100 dark:bg-gray-700',
      textClass: 'text-gray-800 dark:text-gray-200'
    }
  };

  // Mapeamento de tipos de aula para ícones
  const lessonTypeIcons = {
    video: <Play className="w-4 h-4" />,
    audio: <Headphones className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    pdf: <Book className="w-4 h-4" />,
    quiz: <HelpCircle className="w-4 h-4" />,
    assignment: <FileText className="w-4 h-4" />
  };

  const currentStatus = statusConfig[lesson.isPublished ? 'published' : 'draft'];

  const shouldShowBuyButton = !showInstructorActions && lesson.isPublished;

  // Formatar duração (minutos para formato legível)
  const formatDuration = (minutes) => {
    if (!minutes) return 'Duração variável';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const translateLevel = (level) => {
    const levelMap = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
  
    return levelMap[level] || level;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {/* Badge de status */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bgClass} ${currentStatus.textClass}`}>
        {currentStatus.icon}
        {currentStatus.text}
      </div>

      <Link to={`/lessons/${lesson.lessonId}`} className={!lesson.isPublished ? 'opacity-80' : ''}>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <img
            src={lesson.thumbnailUrl || '/images/thumbnail-placeholder.svg'}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-custom-primary text-white text-xs px-3 py-1 rounded-full shadow-md">
            {translateLevel(lesson.level)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center text-white text-xs">
              {lessonTypeIcons[lesson.lessonType]}
              <span className="ml-1 capitalize">{lesson.lessonType}</span>

              {(lesson.lessonType === "video" || lesson.lessonType === "audio") && (
                <>
                  <span className="mx-2">•</span>
                  <Clock className="w-3 h-3" />
                  <span className="ml-1">
                    {lesson.duration > 0
                      ? formatDuration(lesson.duration)
                      : "menos de 1 min"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link 
            to={`/lessons/${lesson.lessonId}`}
            className={`text-lg font-bold hover:text-custom-primary-hover transition-colors ${
              !lesson.isPublished ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
            }`}
          >
            {lesson.title}
          </Link>
          {lesson.isFree ? (
            <span className="text-sm font-semibold text-white bg-custom-primary px-2 py-1 rounded">
              GRÁTIS
            </span>
          ) : (
            <span className="text-xs font-semibold text-custom-primary">
              {formatPrice(lesson.price)}
            </span>
          )}
        </div>

        <p className={`text-sm mb-4 line-clamp-3 ${
          !lesson.isPublished ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
        }`}
          dangerouslySetInnerHTML={{ __html: lesson.shortDescription || lesson.content?.substring(0, 100) + '...' }}
        />
        

        <div className="flex items-center mt-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{lesson.enrolledCount || 0} visualizações</span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center">
            <img
              src={lesson.creator?.avatarUrl || '/images/placeholder.png'}
              alt={lesson.creator?.username || lesson.creator?.fullName}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className={`text-sm ${
              !lesson.isPublished ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {lesson.creator?.username ?? lesson.creator?.fullName ?? 'Instrutor'}
            </span>
          </div>

          <div className="flex space-x-2">
            {showInstructorActions && (
              <>
                <Link
                  to={`/instructor/lessons/${lesson.lessonId}/edit`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Editar
                </Link>
                {lesson.isPublished && (
                  <Link
                    to={`/lessons/${lesson.lessonId}`}
                    className="text-sm font-medium text-custom-primary hover:text-custom-primary-hover"
                  >
                    Visualizar
                  </Link>
                )}
              </>
            )}
            
            {!showInstructorActions && shouldShowBuyButton && (
              <BuyButton 
                contentType={CONTENT_TYPES.LESSON}
                content={lesson} 
                className="w-full text-sm py-2"
                variant='default'
                withIcon={true}
              />
            )}
            
            {!showInstructorActions && !shouldShowBuyButton && (
              <Link
                to={`/lessons/${lesson.lessonId}`}
                className={`text-sm font-medium ${
                  !lesson.isPublished 
                    ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'text-custom-primary hover:text-custom-primary-hover'
                }`}
                onClick={e => !lesson.isPublished && e.preventDefault()}
              >
                Ver Detalhes
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}