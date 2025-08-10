import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Star, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import InviteInstructorModal from './InviteInstructorModal';
import { Button } from '@/components/ui/button';

export default function InstitutionInstructors({ 
  instructors = [], 
  stats = {} 
}) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const instructorsCount = stats?.instructorsCount || 0;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Nossos Instrutores
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {instructorsCount} instrutor{instructorsCount !== 1 ? 'es' : ''} ativo{instructorsCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            {instructorsCount > 0 && (
              <Link 
                to="/institution/instructors/manage" 
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                Gerenciar <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {safeInstructors.slice(0, 3).map((instructor) => {
              const rating = instructor.rating ? instructor.rating.toFixed(1) : 'N/A';
              const coursesCount = instructor.coursesCount || 0;
              const studentsCount = instructor.studentsCount || 0;

              return (
                <div key={instructor.id || Math.random()} className="flex items-center space-x-4">
                  <Avatar 
                    src={instructor.avatar} 
                    name={instructor.fullName}
                    size="md"
                    status={instructor.isActive ? 'active' : 'inactive'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {instructor.fullName || 'Nome não disponível'}
                      </p>
                      <div className="flex items-center text-xs text-amber-500 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-current mr-1" />
                        {rating}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {coursesCount} curso{coursesCount !== 1 ? 's' : ''} • {studentsCount} aluno{studentsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full border-dashed hover:bg-gray-50 dark:hover:bg-gray-700/50"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Novo Instrutor
            </Button>
          </div>
        </div>
      </div>

      <InviteInstructorModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        currentInstructors={safeInstructors}
      />
    </>
  );
}

InstitutionInstructors.propTypes = {
  instructors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      userId: PropTypes.string,
      fullName: PropTypes.string,
      avatar: PropTypes.string,
      isActive: PropTypes.bool,
      rating: PropTypes.number,
      coursesCount: PropTypes.number,
      studentsCount: PropTypes.number
    })
  ),
  stats: PropTypes.shape({
    instructorsCount: PropTypes.number
  })
};

InstitutionInstructors.defaultProps = {
  instructors: [],
  stats: {}
};