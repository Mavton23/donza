import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Star, 
  Clock, 
  Award 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function PerformanceMetrics({ data = {}, courses = [] }) {
  // Dados padrão
  const safeData = {
    averageCompletion: 0,
    engagementRate: 0,
    averageRating: 0,
    chartData: [],
    ...data
  };

  const metrics = [
    {
      name: 'Taxa de Conclusão',
      value: `${safeData.averageCompletion}%`,
      change: safeData.averageCompletionChange,
      icon: Award,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      name: 'Tempo Médio de Estudo',
      value: `${safeData.engagementRate} hrs/sem`,
      change: safeData.engagementRateChange,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Satisfação do Aluno',
      value: safeData.averageRating ? safeData.averageRating.toFixed(1) : 'N/A',
      change: safeData.averageRatingChange,
      icon: Star,
      color: 'text-amber-600 dark:text-amber-400'
    }
  ];

  // Formatação de data para o gráfico
  const formatChartDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Métricas de Desempenho
        </h2>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {metric.name}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${metric.color}`}>
                    {metric.value}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <metric.icon 
                    className={`h-6 w-6 ${metric.color} opacity-80`} 
                    aria-hidden="true"
                  />
                  {metric.change !== undefined && (
                    <span 
                      className={`inline-flex items-center mt-2 text-xs font-medium ${
                        metric.change > 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {metric.change > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(metric.change)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="h-80 mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Progresso dos Alunos (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeData.chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E5E7EB" 
                strokeOpacity={0.3} 
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatChartDate}
                stroke="#6B7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6B7280"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Taxa de Conclusão']}
                labelFormatter={(label) => 
                  new Date(label).toLocaleDateString('pt-BR', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })
                }
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ 
                  r: 5, 
                  stroke: '#4F46E5', 
                  strokeWidth: 2, 
                  fill: '#FFFFFF' 
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cursos com Melhor Desempenho */}
        {courses.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Cursos com Melhor Desempenho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course) => (
                <div 
                  key={course.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {course.title}
                    </h4>
                    <span className="flex items-center text-xs text-amber-500 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {course.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{course.enrollments || 0} alunos</span>
                    <span>{course.completionRate || 0}% conclusão</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            Nenhum curso com dados de desempenho disponível
          </div>
        )}
      </div>
    </div>
  );
}