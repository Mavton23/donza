import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '@/services/api';
import StatCard from './StatsCard';

export default function UserStats({ userId, role }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${userId}/stats`);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-red-500">
      {error}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Suas Estatísticas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {role === 'student' && (
          <>
            <StatCard 
              title="Cursos Inscritos" 
              value={stats?.data?.coursesEnrolled || 0} 
              icon="book-open"
              variant="elevated"
            />
            <StatCard 
              title="Cursos Concluídos" 
              value={stats?.data?.coursesCompleted || 0} 
              icon="graduation-cap"
              variant="elevated"
            />
            <StatCard 
              title="Horas de Estudo" 
              value={stats?.data?.learningHours || 0} 
              icon="clock"
              variant="elevated"
            />
          </>
        )}
        
        {role === 'instructor' && (
          <>
            <StatCard 
              title="Cursos Ministrados" 
              value={stats?.data?.coursesTaught || 0} 
              icon="book-open"
              variant="elevated"
            />
            <StatCard 
              title="Alunos" 
              value={stats?.data?.students || 0} 
              icon="users"
              variant="elevated"
            />
            <StatCard 
              title="Avaliação Média" 
              value={stats?.data?.averageRating ? `${stats.data.averageRating}/5` : 'N/A'} 
              icon="star"
              variant="elevated"
            />
          </>
        )}
        
        <StatCard 
          title="Conquistas" 
          value={stats?.data?.achievements || 0} 
          icon="award"
          variant="elevated"
        />
        <StatCard 
          title="Última Atividade" 
          value={stats?.data?.lastActive ? 
            new Date(stats.data.lastActive).toLocaleString('pt-BR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : 
            'N/A'} 
          icon="activity"
          variant="elevated"
        />
      </div>
    </div>
  );
}

UserStats.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['student', 'instructor', 'institution', 'admin']).isRequired
};