import Icon from "../common/Icon";

export default function InstitutionStats({ stats }) {
  const statCards = [
    {
      title: 'Cursos Totais',
      value: stats.totalCourses || 0,
      change: stats.courseGrowth,
      icon: 'book-open',
      color: 'indigo'
    },
    {
      title: 'Alunos Ativos',
      value: stats.activeStudents || 0,
      change: stats.studentGrowth,
      icon: 'users',
      color: 'green'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats.completionRate}%`,
      change: stats.completionGrowth,
      icon: 'check-circle',
      color: 'blue'
    },
    {
      title: 'Receita',
      value: `R$${stats.revenue?.toLocaleString() || 0}`,
      change: stats.revenueGrowth,
      icon: 'dollar-sign',
      color: 'purple'
    }
  ];

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900',
      text: 'text-indigo-800 dark:text-indigo-200',
      icon: 'text-indigo-500'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-500'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-500'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-800 dark:text-purple-200',
      icon: 'text-purple-500'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const colors = colorMap[stat.color] || colorMap.indigo;
        
        return (
          <div 
            key={index} 
            className={`${colors.bg} ${colors.text} p-6 rounded-xl shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${colors.icon.replace('text', 'bg')} bg-opacity-10`}>
                <Icon 
                  name={stat.icon} 
                  size="lg" 
                  className={`${colors.icon}`}
                  strokeWidth={1.5}
                />
              </div>
            </div>
            {stat.change && (
              <p className="text-xs mt-2">
                {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}% em relação ao último período
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}