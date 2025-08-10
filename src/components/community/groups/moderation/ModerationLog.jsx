import { useState } from 'react';
import { FiUserX, FiTrash2, FiEyeOff, FiCheck, FiFilter, FiAlertTriangle, FiVolumeX } from 'react-icons/fi';
import Avatar from '@/components/common/Avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Dropdown from '@/components/common/Dropdown';
import TimeAgo from '@/components/common/TimeAgo';
import ModerationActionDetails from './ModerationActionDetails';

const actionIcons = {
  BAN: <FiUserX className="text-red-500" />,
  DELETE: <FiTrash2 className="text-red-500" />,
  HIDE: <FiEyeOff className="text-amber-500" />,
  RESOLVE: <FiCheck className="text-green-500" />,
  WARN: <FiAlertTriangle className="text-yellow-500" />,
  MUTE: <FiVolumeX className="text-purple-500" />
};

const actionColors = {
  BAN: 'bg-red-50 dark:bg-red-900/20',
  DELETE: 'bg-red-50 dark:bg-red-900/20',
  HIDE: 'bg-amber-50 dark:bg-amber-900/20',
  RESOLVE: 'bg-green-50 dark:bg-green-900/20',
  WARN: 'bg-yellow-50 dark:bg-yellow-900/20',
  MUTE: 'bg-purple-50 dark:bg-purple-900/20'
};

export default function ModerationLog({ actions, onViewDetails }) {
  const [filter, setFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);

  const filteredActions = actions.filter(action => 
    filter === 'all' || action.actionType === filter
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Moderation History</h3>
        <Dropdown
          trigger={
            <Button variant="outline" size="sm" icon={<FiFilter />}>
              {filter === 'all' ? 'All' : filter}
            </Button>
          }
          items={[
            { label: 'All Actions', onClick: () => setFilter('all') },
            { label: 'Bans', onClick: () => setFilter('BAN') },
            { label: 'Deletions', onClick: () => setFilter('DELETE') },
            { label: 'Warnings', onClick: () => setFilter('WARN') },
            { label: 'Resolutions', onClick: () => setFilter('RESOLVE') },
          ]}
        />
      </div>
      
      {filteredActions.length > 0 ? (
        <div className="space-y-2">
          {filteredActions.map((action) => (
            <div 
              key={action.actionId}
              className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${actionColors[action.actionType] || 'bg-gray-50 dark:bg-gray-800'} border-gray-200 dark:border-gray-700`}
              onClick={() => setSelectedAction(action)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-white dark:bg-gray-900 shadow-sm">
                  {actionIcons[action.actionType]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium capitalize">
                      {action.actionType.toLowerCase()}
                      {action.isAutomated && (
                        <Badge className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          Automated
                        </Badge>
                      )}
                    </p>
                    <TimeAgo 
                      date={action.timestamp} 
                      className="text-xs text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {action.reason}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar 
                        src={action.moderator.avatarUrl} 
                        alt={action.moderator.username} 
                        size="xs"
                      />
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {action.moderator.username}
                      </span>
                    </div>
                    
                    {action.targetUser && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          Target:
                        </span>
                        <Avatar 
                          src={action.targetUser.avatarUrl} 
                          alt={action.targetUser.username} 
                          size="xs"
                        />
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          {action.targetUser.username}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No moderation actions found
        </div>
      )}
      
      {selectedAction && (
        <ModerationActionDetails
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onAppealReview={(decision) => {
            onViewDetails(selectedAction.actionId, decision);
            setSelectedAction(null);
          }}
        />
      )}
    </div>
  );
}