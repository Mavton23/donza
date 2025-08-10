import Avatar from '@/components/common/Avatar';
// import { FiAward, FiCrown, FiStar, FiTrendingUp } from 'react-icons/fi';
import { Crown, Award, Star, TrendingUp } from 'lucide-react';

const podiumColors = [
  'bg-gradient-to-b from-yellow-400 to-yellow-500 text-yellow-900', // 1st place
  'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-800',      // 2nd place
  'bg-gradient-to-b from-amber-500 to-amber-600 text-white'        // 3rd place
];

const podiumHeights = [
  'h-48', // 1st place
  'h-36', // 2nd place
  'h-24'  // 3rd place
];

export default function Leaderboard({ members }) {
  const topThree = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="space-y-8">
      {/* Podium Section */}
      <div className="grid grid-cols-3 gap-5 items-end px-4">
        {topThree.map((member, index) => (
          <div 
            key={member.userId}
            className={`relative rounded-t-xl ${podiumHeights[index]} ${podiumColors[index] || 'bg-gray-100 dark:bg-gray-700'} shadow-lg overflow-hidden`}
          >
            {/* Podium decoration */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
              {/* Ribbon effect */}
              <div className={`absolute top-0 w-full h-2 ${index === 0 ? 'bg-yellow-600' : index === 1 ? 'bg-gray-500' : 'bg-amber-700'}`}></div>
              
              {/* Position indicator */}
              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'} shadow-md`}>
                {index === 0 ? (
                  <Crown className="text-white text-xl" />
                ) : (
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                )}
              </div>
              
              {/* Avatar */}
              <Avatar 
                src={member.avatarUrl} 
                alt={member.username}
                size="lg"
                className="mx-auto -mt-12 border-4 border-white dark:border-gray-800 shadow-md"
              />
              
              {/* User info */}
              <div className="text-center px-2">
                <h3 className="font-bold text-lg truncate w-full">{member.username}</h3>
                <div className="flex items-center justify-center mt-1 space-x-1">
                  <TrendingUp className="text-current opacity-80" />
                  <p className="text-sm font-medium">{member.points} points</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the leaderboard */}
      <div className="space-y-3">
        {rest.map((member, index) => (
          <div 
            key={member.userId}
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xs hover:shadow-sm transition-shadow duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
          >
            <span className="w-8 text-center font-medium text-gray-500 dark:text-gray-400">{index + 4}</span>
            
            <Avatar 
              src={member.avatarUrl} 
              alt={member.username}
              size="md"
              className="mx-3 border-2 border-white dark:border-gray-700"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{member.username}</h4>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center">
                  <Star className="mr-1 text-amber-400" size={14} />
                  Level {member.level}
                </span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center">
                  <TrendingUp className="mr-1 text-blue-400" size={14} />
                  {member.points} points
                </span>
              </div>
            </div>
            
            <div className="flex items-center ml-2">
              {member.recentAchievement && (
                <div className="text-xs font-medium bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full flex items-center shadow-inner">
                  <Award className="mr-1" size={12} />
                  +{member.recentAchievement}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Award className="text-gray-400 text-xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No members yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Activity will appear here once members start participating</p>
        </div>
      )}
    </div>
  );
}