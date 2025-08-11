import Avatar from '@/components/common/Avatar';
import { Crown, Award, Star, TrendingUp } from 'lucide-react';

const podiumData = [
  {
    height: 'h-48',
    gradient: 'bg-gradient-to-b from-yellow-400 to-yellow-500',
    textColor: 'text-yellow-900',
    ribbon: 'bg-yellow-600',
    badge: 'bg-yellow-500',
    icon: <Crown className="text-white text-xl" />
  },
  {
    height: 'h-36',
    gradient: 'bg-gradient-to-b from-gray-300 to-gray-400',
    textColor: 'text-gray-800',
    ribbon: 'bg-gray-500',
    badge: 'bg-gray-400',
    icon: <span className="text-white font-bold text-lg">2</span>
  },
  {
    height: 'h-24',
    gradient: 'bg-gradient-to-b from-amber-500 to-amber-600',
    textColor: 'text-white',
    ribbon: 'bg-amber-700',
    badge: 'bg-amber-600',
    icon: <span className="text-white font-bold text-lg">3</span>
  }
];

export default function LeaderBoard({ members }) {
  const topThree = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="space-y-8">
      {/* Podium Section */}
      <div className="grid grid-cols-3 gap-5 items-end px-4">
        {topThree.map((member, index) => {
          const podiumStyle = podiumData[index];
          return (
            <div 
              key={member.userId}
              className={`relative rounded-t-xl ${podiumStyle.height} ${podiumStyle.gradient} ${podiumStyle.textColor} shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                {/* Ribbon */}
                <div className={`absolute top-0 w-full h-2 ${podiumStyle.ribbon}`}></div>
                
                {/* Position Badge */}
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center ${podiumStyle.badge} shadow-md`}>
                  {podiumStyle.icon}
                </div>
                
                {/* Avatar */}
                <Avatar 
                  src={member.avatarUrl} 
                  alt={member.username}
                  size="lg"
                  className="mx-auto -mt-12 border-4 border-white dark:border-gray-800 shadow-md hover:scale-105 transition-transform"
                />
                
                {/* User Info */}
                <div className="text-center px-2">
                  <h3 className="font-bold text-lg truncate w-full">{member.username}</h3>
                  <div className="flex items-center justify-center mt-1 space-x-1">
                    <TrendingUp className="text-current opacity-80" />
                    <p className="text-sm font-medium">{member?.points?.toLocaleString() || 0} pontos</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="space-y-3">
        {rest.map((member, index) => (
          <div 
            key={member.userId}
            className="group flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900"
          >
            <span className="w-8 text-center font-medium text-gray-500 dark:text-gray-400">{index + 4}</span>
            
            <Avatar 
              src={member.avatarUrl} 
              alt={member.username}
              size="md"
              className="mx-3 border-2 border-white dark:border-gray-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-600 transition-colors"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {member.username}
              </h4>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center">
                  <Star className="mr-1 text-amber-400" size={14} />
                  Nível {member.level}
                </span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center">
                  <TrendingUp className="mr-1 text-blue-400" size={14} />
                  {member?.points?.toLocaleString() || 0} pontos
                </span>
              </div>
            </div>
            
            {member.recentAchievement && (
              <div className="ml-2 flex items-center">
                <div className="text-xs font-medium bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full flex items-center shadow-inner group-hover:scale-105 transition-transform">
                  <Award className="mr-1" size={12} />
                  +{member.recentAchievement}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {members.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Award className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Leaderboard is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Participe de atividades para aparecer aqui
          </p>
        </div>
      )}
    </div>
  );
}