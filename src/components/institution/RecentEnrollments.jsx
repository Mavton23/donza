import { Link } from 'react-router-dom';
import { User, Clock, BookOpen, ChevronRight } from 'lucide-react';
import Avatar from '../common/Avatar';
import ProgressBar from '../common/ProgressBar';

export default function RecentEnrollments({ enrollments }) {
  // Formata a data para exibição
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Matrículas Recentes
          </h2>
          <Link 
            to="/institution/enrollments" 
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Nenhuma matrícula recente encontrada
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {enrollments.slice(0, 5).map((enrollment) => (
              <li key={enrollment.id} className="py-3">
                <div className="flex items-center space-x-4">
                  <Avatar 
                    src={enrollment.student?.avatar} 
                    name={enrollment.student?.fullName} 
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {enrollment.student?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {enrollment.course?.title}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(enrollment.enrolledAt)}
                    </div>
                    {enrollment.progress && (
                      <div className="mt-1 w-24">
                        <ProgressBar 
                          value={enrollment.progress} 
                          size="xs" 
                          color="indigo"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}