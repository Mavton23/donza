import { useState, useEffect } from 'react';
import { 
  BarChart2, Users, BookOpen, Clock, Award, Download, Calendar, Star 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Dropdown from '../components/common/Dropdown';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function InstitutionAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    courseCompletionRate: 0,
    avgStudyTime: 0,
    satisfactionRate: 0
  });
  const [topCourses, setTopCourses] = useState([]);

  const timeOptions = [
    { value: 'last_7_days', label: 'Últimos 7 dias' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'last_90_days', label: 'Últimos 90 dias' },
    { value: 'custom', label: 'Personalizado' }
  ];

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      setError('Usuário não autenticado');
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [analyticsRes, coursesRes] = await Promise.all([
          api.get(`/institution/${user.userId}/analytics`, {
            params: {
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0]
            }
          }),
          api.get(`/institution/${user.userId}/top-courses`)
        ]);

        // Processar dados de analytics
        setMetrics({
          totalStudents: analyticsRes.data.total_students || 0,
          activeStudents: analyticsRes.data.active_students || 0,
          courseCompletionRate: analyticsRes.data.completion_rate || 0,
          avgStudyTime: analyticsRes.data.avg_study_time || 0,
          satisfactionRate: analyticsRes.data.satisfaction_rate || 0
        });

        // Formatando dados para os gráficos
        const formattedChartData = analyticsRes.data.trends?.map(item => ({
          date: new Date(item.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
          students: item.active_students || 0,
          completions: item.completions || 0,
          studyTime: item.avg_study_time || 0
        })) || [];

        setChartData(formattedChartData);
        setTopCourses(coursesRes.data || []);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Erro ao carregar dados analíticos');
        toast.error('Falha ao carregar análises', {
          description: error.response?.data?.message || error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.userId, timeRange, startDate, endDate]);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    const now = new Date();
    
    switch(value) {
      case 'last_7_days':
        setStartDate(new Date(now - 7 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_30_days':
        setStartDate(new Date(now - 30 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case 'last_90_days':
        setStartDate(new Date(now - 90 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      default:
        // Manter as datas personalizadas
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          Nenhuma instituição autenticada
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análises Institucionais</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Métricas e tendências de desempenho
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Dropdown
            options={timeOptions}
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="w-full sm:w-48"
          />
          
          {timeRange === 'custom' && (
            <div className="flex gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border rounded-md px-3 py-1.5 text-sm w-32"
                dateFormat="dd/MM/yyyy"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border rounded-md px-3 py-1.5 text-sm w-32"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          )}
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          title="Total de Alunos"
          value={metrics.totalStudents}
          change={5.2}
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          title="Alunos Ativos"
          value={metrics.activeStudents}
          change={2.8}
          color="text-green-600 dark:text-green-400"
        />
        <MetricCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Conclusão de Cursos"
          value={`${metrics.courseCompletionRate}%`}
          change={1.5}
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          title="Tempo Médio de Estudo"
          value={`${metrics.avgStudyTime}h/sem`}
          change={-0.8}
          color="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          icon={<Award className="h-5 w-5" />}
          title="Satisfação"
          value={`${metrics.satisfactionRate}%`}
          change={3.2}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de linhas - Alunos ativos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Alunos Ativos e Conclusões
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  name="Alunos Ativos" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completions" 
                  name="Conclusões" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de barras - Tempo de estudo */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tempo Médio de Estudo (horas/semana)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="studyTime" 
                  name="Horas de Estudo" 
                  fill="#6366F1" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de cursos com melhor desempenho */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Cursos com Melhor Desempenho
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Alunos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Conclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Satisfação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {topCourses.slice(0, 5).map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {course.enrollments}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 mr-2">
                        <ProgressBar 
                          value={course.completionRate} 
                          size="xs" 
                          color={course.completionRate > 70 ? 'emerald' : 'amber'}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {course.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-current mr-1" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {course.rating?.toFixed(1) || '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para os cards de métricas
function MetricCard({ icon, title, value, change, color = 'text-blue-600 dark:text-blue-400' }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${color.replace('text', 'bg')} bg-opacity-10`}>
            {icon}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
        {change && (
          <span className={`inline-flex items-center text-xs font-medium ${
            change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change > 0 ? (
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar ProgressBar
function ProgressBar({ value, size = 'md', color = 'blue' }) {
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    emerald: 'bg-emerald-600 dark:bg-emerald-500',
    amber: 'bg-amber-600 dark:bg-amber-500'
  };

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]}`}>
      <div 
        className={`${colorClasses[color]} rounded-full ${sizeClasses[size]}`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}