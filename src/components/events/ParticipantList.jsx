import Avatar from '../common/Avatar';

export default function ParticipantList({ participants, isOrganizer }) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Ainda não há participantes.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {participants.map((participant) => (
        <li key={participant?.user.userId} className="py-4">
          <div className="flex items-center">
            <Avatar 
              src={participant.avatarUrl}
              name={participant?.user.username}
              size="md"
            />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {participant?.user.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {participant?.user.email}
              </p>
            </div>
            {isOrganizer && (
              <button className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline">
                Remover
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}