import { Link } from 'react-router-dom';
import { Clock, Users, Lock, ChevronRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function StudyGroupCard({ group, communityId, isMember = false }) {
  const {
    groupId,
    name = 'Grupo sem nome',
    description = 'Nenhuma descrição fornecida',
    meetingSchedule = {},
    maxMembers,
    privacy = 'public',
    tags = [],
    coverImageUrl,
    createdAt,
    membersCount = 0,
    status
  } = group;

  const isPrivate = privacy === 'private';
  const isFull = maxMembers && parseInt(membersCount) >= maxMembers;
  const progressPercentage = maxMembers ? (parseInt(membersCount) / maxMembers) * 100 : 0;
  const isActive = status === 'active';
  
  const formatMeetingSchedule = () => {
    if (!meetingSchedule || !meetingSchedule.frequency) return 'Nenhuma reunião agendada';
    
    const { frequency, weekdays = [], time, duration } = meetingSchedule;
    
    if (frequency === 'weekly' && weekdays.length) {
      const days = weekdays.map(day => {
        const dayMap = {
          monday: 'Segunda',
          tuesday: 'Terça',
          wednesday: 'Quarta',
          thursday: 'Quinta',
          friday: 'Sexta',
          saturday: 'Sábado',
          sunday: 'Domingo'
        };
        return dayMap[day.toLowerCase()] || day;
      });
      return `Semanalmente às ${days.join(', ')} às ${time} (${duration} min)`;
    }
    
    return `Reuniões ${frequency === 'weekly' ? 'semanais' : frequency} às ${time}`;
  };

  const renderTags = () => {
    if (!tags.length) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/80 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 overflow-hidden flex flex-col h-full">
      {/* Cover Image (if available) */}
      {coverImageUrl && (
        <div className="h-32 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <img 
            src={coverImageUrl} 
            alt={`Capa do grupo ${name}`}
            className="w-full h-full object-cover"
          />
          {!isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-full text-sm">
                Inativo
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Header with gradient */}
      <div className={cn(
        "px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50",
        isPrivate ? "bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20" : "bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/50 dark:to-blue-900/20"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              {isPrivate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Lock className="h-3 w-3 mr-1" />
                  Privado
                </span>
              )}
            </div>
            <div 
              className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 prose dark:prose-invert prose-sm"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            {renderTags()}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4 space-y-4 flex-1">
        {/* Members Progress */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-300 flex items-center">
              <Users className="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />
              Membros
            </span>
            {maxMembers ? (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {membersCount}/{maxMembers}
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {membersCount} membros
              </span>
            )}
          </div>
          {maxMembers && (
            <Progress 
              value={progressPercentage}
              className={cn(
                "h-2",
                progressPercentage >= 90 ? 'bg-red-400 dark:bg-red-500' :
                progressPercentage >= 75 ? 'bg-amber-400 dark:bg-amber-500' :
                'bg-gray-300 dark:bg-gray-700'
              )}
            />
          )}
        </div>

        {/* Meeting Schedule */}
        <div className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg">
          <div className="p-2 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Agenda de Reuniões</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatMeetingSchedule()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-700/30">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Criado {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          
          {isMember ? (
            <Button 
              variant="outline"
              size="sm"
              className="group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
              asChild
            >
              <Link 
                to={`/communities/${communityId}/groups/${groupId}`}
                className="flex items-center gap-1"
              >
                Ver grupo <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : (
            <Button 
              variant={isFull ? "disabled" : isActive ? "default" : "disabled"}
              size="sm"
              disabled={isFull || !isActive}
              className={cn(
                !isFull && isActive && "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",
                "transition-colors"
              )}
              asChild
            >
              <Link 
                to={`/communities/${communityId}/groups/${groupId}/join`}
                className="flex items-center gap-1"
              >
                {!isActive ? 'Grupo inativo' : isFull ? 'Grupo lotado' : 'Entrar no grupo'}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}