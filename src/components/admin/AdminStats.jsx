import { useState, useEffect, useRef } from 'react';
import StatCard from '../common/StatCard';
import Icon from '../common/Icon';
import StatusBadge from '../common/StatusBadge';
import { Chart as ChartJS, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '@/services/api';
import LoadingSpinner from '../common/LoadingSpinner';

ChartJS.register(
  BarElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend
);

const colorMap = {
  users: { bg: 'rgba(99, 102, 241, 0.6)', border: 'rgba(99, 102, 241, 1)' },
  courses: { bg: 'rgba(16, 185, 129, 0.6)', border: 'rgba(16, 185, 129, 1)' },
  events: { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
  messages: { bg: 'rgba(139, 92, 246, 0.6)', border: 'rgba(139, 92, 246, 1)' }
};

export default function AdminStats({ systemStatus, pendingVerifications }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState({
    stats: true,
    charts: true
  });
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true, charts: true }));
        setError(null);
        
        const [statsRes, chartRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/stats/chart', { params: { range: timeRange } })
        ]);
        
        setStats(statsRes.data);
        processChartData(chartRes.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('Falha ao carregar dados. Tente recarregar a página.');
      } finally {
        setLoading(prev => ({ ...prev, stats: false, charts: false }));
      }
    };

    fetchData();
  }, [timeRange]);

  const processChartData = (apiData) => {
    if (!apiData?.data?.labels || !apiData.data.datasets) {
      setChartData(null);
      return;
    }

    const formattedData = {
      labels: apiData.data.labels,
      datasets: apiData.data.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: getDatasetColor(dataset.label, true),
        borderColor: getDatasetColor(dataset.label, false),
        borderWidth: 1,
        tension: 0.1
      }))
    };

    setChartData(formattedData);
  };

  const getDatasetColor = (label, isBackground) => {
    const key = label.toLowerCase().includes('usuário') ? 'users' :
               label.toLowerCase().includes('curso') ? 'courses' :
               label.toLowerCase().includes('evento') ? 'events' : 'messages';
    
    return isBackground ? colorMap[key].bg : colorMap[key].border;
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderSystemHealth = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Saúde do Sistema
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Status Geral</span>
          <StatusBadge status={systemStatus?.status || 'unknown'} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Tempo de Atividade</span>
          <span className="font-medium">
            {formatUptime(systemStatus?.uptime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Versão da API</span>
          <span className="font-medium">
            {systemStatus?.checks?.api?.version || 'N/A'}
          </span>
        </div>
      </div>

      <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6 mb-3">
        Componentes
      </h4>
      <div className="space-y-3">
        {systemStatus?.checks && Object.entries(systemStatus.checks).map(([component, data]) => (
          <div key={component} className="flex items-center justify-between">
            <span className="capitalize text-gray-600 dark:text-gray-300">{component}</span>
            <StatusBadge status={data.status} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = (ChartComponent, title) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="h-80">
        {loading.charts ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-red-500">
            <Icon name="alert-circle" size="lg" className="mb-2" />
            <p>{error}</p>
          </div>
        ) : chartData ? (
          <ChartComponent
            ref={chartRef}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: '#6B7280',
                    font: { size: 12 }
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#6B7280' }
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#E5E7EB' },
                  ticks: { color: '#6B7280' }
                }
              }
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Nenhum dado disponível
          </div>
        )}
      </div>
    </div>
  );

  if (loading.stats && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Visão Geral do Sistema
        </h2>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            disabled={loading.charts}
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="semester">Último Semestre</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats?.totalUsers || 0}
          icon={<Icon name="users" className="text-indigo-500" />}
          loading={loading.stats}
        />
        <StatCard
          title="Cursos Ativos"
          value={stats?.activeCourses || 0}
          icon={<Icon name="book" className="text-green-500" />}
          loading={loading.stats}
        />
        <StatCard
          title="Eventos Agendados"
          value={stats?.upcomingEvents || 0}
          icon={<Icon name="calendar" className="text-blue-500" />}
          loading={loading.stats}
        />
        <StatCard
          title="Mensagens Enviadas"
          value={stats?.totalMessages || 0}
          icon={<Icon name="message-square" className="text-purple-500" />}
          loading={loading.stats}
        />
      </div>

      {/* Gráficos e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderChart(Bar, 'Atividades Recentes')}
        </div>
        {renderSystemHealth()}
      </div>

      {/* Gráfico de Tendência */}
      {renderChart(Line, 'Tendência de Crescimento')}
    </div>
  );
}