import Avatar from '../common/Avatar';
import Icon from '../common/Icon';

export default function SelectedParticipants({ participants, onRemove }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Participants ({participants.length})
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {participants.map(user => (
          <div
            key={user.userId}
            className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-2 pr-1 py-1"
          >
            <Avatar user={user} size="xs" className="mr-2" />
            <span className="text-sm text-gray-900 dark:text-white mr-1">
              {user.username}
            </span>
            <button
              onClick={() => onRemove(user.userId)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}