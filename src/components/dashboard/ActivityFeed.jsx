import { Clock, BookOpen, CheckCircle, MessageSquare, Video } from 'lucide-react';

const activityIcons = {
  course_started: BookOpen,
  lesson_completed: CheckCircle,
  new_message: MessageSquare,
  live_event: Video
};

const activityColors = {
  course_started: 'text-indigo-600 dark:text-indigo-400',
  lesson_completed: 'text-green-600 dark:text-green-400',
  new_message: 'text-blue-600 dark:text-blue-400',
  live_event: 'text-purple-600 dark:text-purple-400'
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h2>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 mt-1 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
            Ver toda a atividade
          </button>
        </div>
      </div>
    </div>
  );
}