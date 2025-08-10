import { Link } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import { formatPrice } from '@/utils/formatPrice';
import { FileEdit, CheckCircle, Archive, StarIcon } from 'lucide-react';

export default function CourseCard({ 
  course, 
  showProgress = false,
  showInstructorActions = false,
  showStatus = false,
  statusBadge = false,
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

  const currentStatus = statusConfig[course.status] || statusConfig.draft;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative ${
      variant === 'instructor' ? 'border-l-4' : ''
    } ${
      variant === 'instructor' && course.status === 'published' ? 'border-l-green-500' :
      variant === 'instructor' && course.status === 'draft' ? 'border-l-yellow-500' :
      variant === 'instructor' ? 'border-l-gray-500' : ''
    }`}>
      {/* Badge de status */}
      {statusBadge && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bgClass} ${currentStatus.textClass}`}>
          {currentStatus.icon}
          {showStatus && currentStatus.text}
        </div>
      )}

      <Link to={`/courses/${course.slug}`} className={course.status === 'archived' ? 'opacity-80' : ''}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <img
            src={course.coverImageUrl || '/images/thumbnail-placeholder.svg'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-xs font-semibold text-white bg-indigo-600 px-2 py-1 rounded">
              {course.level}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Link 
            to={`/courses/${course.slug}`}
            className={`text-lg font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
              course.status === 'archived' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
            }`}
          >
            {course.title}
          </Link>
          {Number(course.price) > 0 ? (
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {formatPrice(course.price)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
              GRÁTIS
            </span>
          )}
        </div>

        <p className={`text-sm mb-4 line-clamp-2 ${
          course.status === 'archived' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {course.shortDescription}
        </p>

        <div className={`flex items-center justify-between text-sm mb-4 ${
          course.status === 'archived' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{course.lessonsCount || 0} aulas</span>
          <span>{course.enrolledCount || 0} alunos</span>
        </div>

        <div className="flex items-center mt-2 mb-4">
          <div className="flex items-center mr-4">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
              {course?.averageRating?.toFixed(1) || 'Novo'}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({course?.ratingCount || 0} avaliações)
          </span>
        </div>

        {showProgress && course.progress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Progresso</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {Math.round(course.progress.percentage)}% completo
              </span>
            </div>
            <ProgressBar 
              percentage={course.progress.percentage} 
              height={4}
            />
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={course.creator?.avatarUrl ?? course.instructor?.avatarUrl ?? '/images/placeholder.png'}
              alt={course.creator?.fullName || course.instructor?.fullName}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className={`text-sm ${
              course.status === 'archived' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {course.organizer?.username ?? course.instructor?.fullName ?? 'Instrutor'}
            </span>
          </div>

          <div className="flex space-x-2">
            {showInstructorActions && (
              <>
                <Link
                  to={`/instructor/courses/${course.courseId}/edit`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Editar
                </Link>
                {course.status === 'published' && (
                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Visualizar
                  </Link>
                )}
              </>
            )}
            
            {!showInstructorActions && (
              <Link
                to={`/courses/${course.slug}`}
                className={`text-sm font-medium ${
                  course.status === 'archived' 
                    ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500'
                }`}
                onClick={e => course.status === 'archived' && e.preventDefault()}
              >
                {showProgress ? 'Continuar' : 'Ver Detalhes'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}