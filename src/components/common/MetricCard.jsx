export default function MetricCard({ title, value, trend, icon, color }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', darkBg: 'bg-indigo-900/20', darkText: 'text-indigo-400' },
    green: { bg: 'bg-green-50', text: 'text-green-600', darkBg: 'bg-green-900/20', darkText: 'text-green-400' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'bg-blue-900/20', darkText: 'text-blue-400' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', darkBg: 'bg-yellow-900/20', darkText: 'text-yellow-400' },
  };

  return (
    <div className={`${colors[color].bg} ${colors[color].darkBg} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`mt-1 text-2xl font-semibold ${colors[color].text} ${colors[color].darkText}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${colors[color].bg} ${colors[color].darkBg}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}