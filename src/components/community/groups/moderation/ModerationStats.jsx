import { FiAlertTriangle, FiUserX, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function ModerationStats({ stats, memberCount }) {
  const metrics = [
    {
      title: 'Active Reports',
      value: stats?.pendingReports,
      icon: <FiAlertTriangle className="text-amber-500" />,
      change: stats?.reportsChange,
    },
    {
      title: 'Banned Members',
      value: stats?.bannedMembers,
      icon: <FiUserX className="text-red-500" />,
      change: stats?.bannedChange,
    },
    {
      title: 'Resolved Today',
      value: stats?.resolvedToday,
      icon: <FiCheckCircle className="text-green-500" />,
      change: stats?.resolvedChange,
    },
    {
      title: 'Avg Response Time',
      value: `${stats?.avgResponseTime}m`,
      icon: <FiClock className="text-blue-500" />,
      change: stats?.responseTimeChange,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-medium mb-4">Moderation Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-lg">{metric.icon}</span>
              <span className="text-sm">{metric.title}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">{metric.value}</span>
              {metric.change && (
                <span className={`text-xs ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {memberCount} total members • {stats?.trustScore}% trust score
        </p>
      </div>
    </div>
  );
}