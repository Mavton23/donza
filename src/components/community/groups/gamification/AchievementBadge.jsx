import { FiAward } from 'react-icons/fi';

const badgeColors = {
  bronze: 'bg-amber-600 text-white',
  silver: 'bg-gray-300 text-gray-800',
  gold: 'bg-yellow-400 text-yellow-800',
  platinum: 'bg-blue-200 text-blue-800',
  default: 'bg-purple-100 text-purple-800'
};

export default function AchievementBadge({ 
  title, 
  description, 
  tier = 'default',
  unlocked = false,
  unlockedAt,
  size = 'md'
}) {
  const sizes = {
    sm: 'text-xs p-1.5',
    md: 'text-sm p-2',
    lg: 'text-base p-3'
  };

  return (
    <div className={`relative rounded-lg flex items-center ${unlocked ? badgeColors[tier] || badgeColors.default : 'bg-gray-100 dark:bg-gray-700'} ${sizes[size]}`}>
      <FiAward className={`flex-shrink-0 ${unlocked ? 'text-white' : 'text-gray-400'} ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
      <div className="ml-2">
        <div className={`font-medium ${!unlocked && 'text-gray-500'}`}>{title}</div>
        {unlocked && description && (
          <div className="text-xs opacity-80">{description}</div>
        )}
      </div>
      {unlockedAt && unlocked && (
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-xs px-1.5 py-0.5 rounded-full shadow">
          {new Date(unlockedAt).toLocaleDateString('short')}
        </div>
      )}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500">LOCKED</div>
        </div>
      )}
    </div>
  );
}