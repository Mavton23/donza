import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { Button } from '../../components/ui/button';

export default function StudyGroupHeader({ group, isMember, onJoin, onLeave }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {group.coverImage ? (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Icon name="book-open" size="xl" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {group.name}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {group.description || 'No description provided'}
            </p>
          </div>

          {isMember ? (
            <Button
              variant="danger"
              onClick={onLeave}
              icon="user-minus"
            >
              Leave Group
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onJoin}
              icon="user-plus"
            >
              Join Group
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Icon name="users" size="sm" />
            {group.membersCount} members
          </span>
          <span className="flex items-center gap-1">
            <Icon name="calendar" size="sm" />
            {group.meetingsCount} meetings
          </span>
          <span className="flex items-center gap-1">
            <Icon name="clock" size="sm" />
            Created {new Date(group.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}