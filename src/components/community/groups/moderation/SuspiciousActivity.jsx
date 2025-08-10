import { FiAlertOctagon, FiUser, FiCheckCircle, FiEye, FiMessageSquare } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TimeAgo from '@/components/common/TimeAgo';

const activityIcons = {
  MESSAGE: <FiMessageSquare className="text-blue-500" />,
  LOGIN: <FiUser className="text-green-500" />,
  CONTENT: <FiEye className="text-purple-500" />,
  DEFAULT: <FiAlertOctagon className="text-amber-500" />
};

export default function SuspiciousActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30 p-4 text-center">
        <div className="flex items-center justify-center text-green-800 dark:text-green-200">
          <FiCheckCircle className="mr-2" />
          <span>Nenhuma atividade suspeita recente</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
        <div className="flex items-center text-red-800 dark:text-red-200">
          <FiAlertOctagon className="mr-2" />
          <h3 className="font-medium">Atividades Suspeitas</h3>
        </div>
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {activities.length} alertas
        </Badge>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                {activityIcons[activity.type] || activityIcons.DEFAULT}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {activity.user?.username || 'Usuário desconhecido'}
                  </h4>
                  <TimeAgo 
                    date={activity.timestamp} 
                    className="text-xs text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {activity.description}
                </p>
                
                {activity.metadata && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {activity.metadata.contentId && (
                      <div>ID do conteúdo: {activity.metadata.contentId}</div>
                    )}
                    {activity.metadata.reason && (
                      <div>Motivo: {activity.metadata.reason}</div>
                    )}
                    {activity.metadata.count && (
                      <div>Ocorrências: {activity.metadata.count}</div>
                    )}
                  </div>
                )}
                
                <div className="mt-3 flex gap-2">
                  <Button variant="outline-danger" size="xs">
                    Banir
                  </Button>
                  <Button variant="outline-warning" size="xs">
                    Advertir
                  </Button>
                  <Button variant="outline" size="xs">
                    Investigar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 5 && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
          <Button variant="link" size="sm">
            Ver todas as atividades ({activities.length})
          </Button>
        </div>
      )}
    </div>
  );
}