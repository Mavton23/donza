import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import ProgressBar from '../common/ProgressBar';

/**
 * Componente para exibir uma tabela de cursos institucionais
 * @param {Array} courses - Lista de cursos
 * @param {string} institutionId - ID da instituição
 * @param {boolean} showAllCourses - Se deve mostrar todos os cursos ou apenas os destacados
 */
const InstitutionCoursesTable = ({ 
  courses = [], 
  institutionId, 
  showAllCourses = false 
}) => {
  const safeCourses = Array.isArray(courses) ? courses : [];

  // Cores para os diferentes status dos cursos
  const statusColors = {
    published: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
    draft: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700',
    archived: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30'
  };

  // Texto para o status do curso
  const getStatusText = (status) => {
    switch(status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  // Cor da barra de progresso baseada no percentual
  const getProgressColor = (percent) => {
    if (percent > 70) return 'emerald';
    if (percent > 40) return 'amber';
    return 'rose';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        {/* Cabeçalho da tabela */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {showAllCourses ? 'Todos os Cursos' : 'Cursos em Destaque'}
          </h2>
          
          {safeCourses.length > 0 && (
            <Link 
              to={`/institution/${institutionId}/courses`}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>

        {/* Tabela de cursos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Curso
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Inscritos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progresso
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avaliação
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {safeCourses.slice(0, showAllCourses ? 10 : 3).map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Coluna do Curso */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="ml-4">
                        <Link 
                          to={`/institution/courses/${course.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {course.title}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {course.category || 'Sem categoria'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Coluna de Inscritos */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {course.enrollments || 0}
                      </span>
                    </div>
                  </td>
                  
                  {/* Coluna de Progresso */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ProgressBar 
                        value={course.completionRate || 0} 
                        size="sm" 
                        color={getProgressColor(course.completionRate)}
                      />
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {course.completionRate || 0}%
                      </span>
                    </div>
                  </td>
                  
                  {/* Coluna de Avaliação */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-current mr-1" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {course.rating ? course.rating.toFixed(1) : '-'}
                      </span>
                      {course.reviews > 0 && (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({course.reviews} avaliações)
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Coluna de Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[course.status] || statusColors.draft}`}>
                      {getStatusText(course.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vazio */}
        {safeCourses.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum curso encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {showAllCourses ? 
                'Crie seu primeiro curso institucional' : 
                'Nenhum curso em destaque no momento'}
            </p>
            <div className="mt-6">
              <Link
                to={`/institution/${institutionId}/courses/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Criar Novo Curso
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Validação de props
InstitutionCoursesTable.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      category: PropTypes.string,
      enrollments: PropTypes.number,
      completionRate: PropTypes.number,
      rating: PropTypes.number,
      reviews: PropTypes.number,
      status: PropTypes.oneOf(['published', 'draft', 'archived'])
    })
  ),
  institutionId: PropTypes.string.isRequired,
  showAllCourses: PropTypes.bool
};

export default InstitutionCoursesTable;