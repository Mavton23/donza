import { Link } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import { Menu, X, ChevronLeft } from 'lucide-react';

export default function CourseProgressHeader({ course, enrollment, onToggleSidebar }) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link
              to={`/courses/${course.slug}`}
              className="ml-2 flex items-center text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1 text-sm">Voltar ao curso</span>
            </Link>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {course.title}
            </h2>
            {enrollment && (
              <div className="mt-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Progresso: {Math.round(enrollment.progress)}%
                  </span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {enrollment.completed ? 'Concluído' : 'Em progresso'}
                  </span>
                </div>
                <ProgressBar 
                  percentage={enrollment.progress} 
                  height={2}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {/* Botões de ação podem ser adicionados aqui */}
          </div>
        </div>
      </div>
    </header>
  );
}