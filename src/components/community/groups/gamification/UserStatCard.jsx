import Avatar from '@/components/common/Avatar';
import ProgressBar from './ProgressBar';
import AchievementBadge from './AchievementBadge';
import { FiAward, FiCheckCircle, FiFileText, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';

export default function UserStatsCard({ userStats }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Cabeçalho com perfil do usuário */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar 
              className="h-14 w-14 rounded-full border-4 border-white dark:border-gray-700 shadow-sm"
              src={userStats.avatarUrl} 
              alt={userStats.username}
            />
            <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white rounded-full p-1 border-2 border-white dark:border-gray-700">
              <FiAward className="h-3 w-3" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{userStats.username}</h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Nível {userStats.level}
              </span>
              <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiTrendingUp className="mr-1 text-blue-500" size={14} />
                {userStats.points} pontos
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso até o Nível {userStats.level + 1}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {userStats.currentLevelProgress}/{userStats.nextLevelThreshold}
            </span>
          </div>
          <ProgressBar 
            value={userStats.currentLevelProgress}
            max={userStats.nextLevelThreshold}
            color="purple"
            className="h-3 rounded-full"
          />
        </div>

        {/* Seção de conquistas */}
        <div>
          <h4 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiAward className="mr-2 text-amber-500" />
            Conquistas Recentes
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {(() => {
              if (!userStats || typeof userStats !== 'object' || Array.isArray(userStats)) {
                return (
                  <div className="col-span-2 text-center py-6">
                    <div className="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <FiAward className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Dados do usuário indisponíveis</p>
                  </div>
                );
              }

              if (!Array.isArray(userStats.recentAchievements)) {
                return (
                  <div className="col-span-2 text-center py-6">
                    <div className="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <FiAward className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Dados das conquistas indisponíveis</p>
                  </div>
                );
              }

              if (userStats.recentAchievements.length === 0) {
                return (
                  <div className="col-span-2 text-center py-6">
                    <div className="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <FiAward className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma conquista ainda</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Conclua tarefas para ganhar conquistas</p>
                  </div>
                );
              }

              return userStats.recentAchievements.map((achievement) => {
                if (!achievement || typeof achievement !== 'object') return null;

                return (
                  <AchievementBadge
                    key={achievement.id || `${achievement.title}-${Math.random().toString(36).substr(2, 9)}`}
                    title={achievement.title || 'Conquista Sem Título'}
                    description={achievement.description || 'Sem descrição disponível'}
                    tier={['bronze', 'silver', 'gold'].includes(achievement.tier) 
                      ? achievement.tier 
                      : 'bronze'}
                    unlocked={!!achievement.unlocked}
                    unlockedAt={achievement.unlockedAt || new Date().toISOString()}
                    size="md"
                    className="hover:scale-[1.02] transition-transform duration-200"
                  />
                );
              }).filter(Boolean);
            })()}
          </div>
        </div>

        {/* Grade de estatísticas */}
        <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="mx-auto h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                <FiCheckCircle className="text-purple-600 dark:text-purple-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.completedTasks}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarefas</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="mx-auto h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <FiFileText className="text-blue-600 dark:text-blue-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.contributedContent}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recursos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="mx-auto h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                <FiMessageSquare className="text-green-600 dark:text-green-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.helpfulReplies}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Respostas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
