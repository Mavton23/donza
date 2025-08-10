import { FiCheck, FiClock, FiUser, FiAlertCircle, FiArrowRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TaskItem({ 
  task, 
  canEdit, 
  canManage,
  isLast, 
  onAssignClick, 
  onEditClick,
  onDeleteClick,
  onStatusChange 
}) {
  const statusConfig = {
    pending: {
      icon: <FiClock className="text-amber-500" />,
      text: 'Pendente',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
    },
    in_progress: {
      icon: <FiArrowRight className="text-blue-500" />,
      text: 'Em progresso',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    completed: {
      icon: <FiCheck className="text-emerald-500" />,
      text: 'Concluída',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
    },
    archived: {
      icon: <FiAlertCircle className="text-gray-500" />,
      text: 'Arquivada',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-300'
    }
  };

  const priorityConfig = {
    low: {
      text: 'Baixa',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    medium: {
      text: 'Média',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    },
    high: {
      text: 'Alta',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
  };

  const { status, priority, deadline, assignees = [], assignments = [] } = task;
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const priorityInfo = priorityConfig[priority] || priorityConfig.medium;

  // Verifica se a tarefa está atrasada
  const isOverdue = deadline && new Date(deadline) < new Date() && status !== 'completed';

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors",
      !isLast && "border-b border-gray-200 dark:border-gray-700",
      isOverdue && "bg-red-50/50 dark:bg-red-900/10"
    )}>
      {/* Checkbox e informações básicas */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => {
            const newStatus = status === 'completed' ? 'pending' : 'completed';
            try {
              onStatusChange(newStatus);
            } catch (error) {
              console.error("Failed to update task status:", error);
            }
          }}
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
            status === 'completed' 
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500',
            isOverdue && 'border-red-300 dark:border-red-500'
          )}
          disabled={!canManage}
        >
          {status === 'completed' && <FiCheck className="w-3 h-3" />}
        </button>

        <div className="min-w-0">
          <h3 className={cn(
            "font-medium truncate",
            status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white',
            isOverdue && 'text-red-600 dark:text-red-400'
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className={cn(
              "text-sm mt-1 line-clamp-1",
              status === 'completed' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
            )}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Metadados e ações */}
      <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 text-sm">
        {/* Prioridade */}
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          priorityInfo.color,
          isOverdue && 'dark:bg-red-800/30 dark:text-red-300'
        )}>
          {priorityInfo.text}
        </span>

        {/* Status */}
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          statusInfo.color,
          isOverdue && status !== 'completed' && 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
        )}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.text}</span>
        </span>

        {/* Prazo */}
        {deadline && (
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            isOverdue 
              ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          )}>
            <FiClock className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(deadline), { 
              addSuffix: true,
              locale: ptBR
            })}
          </span>
        )}

        {/* Atribuído a */}
        {assignments.length > 0 ? (
          <div className="flex items-center">
            {assignments.slice(0, 2).map((assignment, index) => (
              <div 
                key={assignment.userId} 
                className={cn(
                  "flex items-center -ml-1 first:ml-0",
                  assignments.length > 2 && index === 1 && "relative"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                  {assignment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {assignments.length > 2 && index === 1 && (
                  <div className="absolute -right-1 -bottom-1 bg-gray-300 dark:bg-gray-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    +{assignments.length - 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={onAssignClick}
          >
            <FiUser className="mr-1 w-3 h-3" />
            Atribuir
          </Button>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">Não atribuída</span>
        )}

        {/* Ações para edição */}
        {canManage && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              onClick={() => onEditClick(task)}
            >
              <FiEdit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => onDeleteClick(task)}
            >
              <FiTrash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}