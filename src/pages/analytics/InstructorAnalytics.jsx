import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import MetricCard from '@/components/common/MetricCard';
import api from '../../services/api';

export default function InstructorAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dashboard/instructor/analytics?range=${timeRange}`);
                const transformedData = {
          ...response.data,
          totalStudents: response.data.totalStudents || 0,
          totalEnrollments: response.data.totalEnrollments || 0,
          completionRate: Math.round(response.data.completionRate) || 0,
          averageRating: parseFloat(response.data.averageRating).toFixed(1) || '0.0',
          enrollmentsOverTime: response.data.enrollmentsOverTime.map(item => ({
            date: item.date,
            enrollments: parseInt(item.enrollments) || 0
          })),
          topCourses: [...response.data.topCourses]
            .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0))
            .slice(0, 5),
          studentDemographics: response.data.studentDemographics.map(demo => ({
            category: demo.category || 'Unknown',
            value: Math.min(100, Math.max(0, Math.round(demo.value)))
          }))
        };
        
        setAnalytics(transformedData);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar dados analíticos');
        console.error('Erro ao buscar análises:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Função para formatar o tooltip do gráfico
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400">
            Inscrições: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Painel de Análises</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Insights e métricas sobre seus cursos e alunos
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '7days' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '30days' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setTimeRange('90days')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === '90days' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            90 Dias
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !analytics ? (
        <EmptyState
          title="Nenhum dado analítico disponível"
          description="Seu painel de análises será preenchido à medida que você ganhar alunos e inscrições."
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total de Alunos" 
              value={analytics.totalStudents} 
              trend="up" 
              icon="users"
              color="indigo"
            />
            <MetricCard 
              title="Inscrições em Cursos" 
              value={analytics.totalEnrollments} 
              trend="up" 
              icon="book"
              color="green"
            />
            <MetricCard 
              title="Taxa de Conclusão" 
              value={`${analytics.completionRate}%`} 
              trend={analytics.completionRate > 70 ? "up" : "down"} 
              icon="check-circle"
              color="blue"
            />
            <MetricCard 
              title="Avaliação Média" 
              value={`${analytics.averageRating}/5`} 
              trend={parseFloat(analytics.averageRating) > 4 ? "up" : "down"} 
              icon="star"
              color="yellow"
            />
          </div>

          {/* Enrollments Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Inscrições ao Longo do Tempo
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Últimos {timeRange.replace('days', '')} dias
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.enrollmentsOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <Tooltip content={renderTooltip} />
                  <Bar 
                    dataKey="enrollments" 
                    name="Inscrições"
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cursos Mais Populares por Inscrições
              </h2>
              <div className="space-y-4">
                {analytics.topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                        {course.title}
                      </span>
                    </div>
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                      {course.enrollments} inscrições
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Demographics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Demografia dos Alunos
              </h2>
              <div className="space-y-4">
                {analytics.studentDemographics.map((demo) => (
                  <div key={demo.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {demo.category}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {demo.value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${demo.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}