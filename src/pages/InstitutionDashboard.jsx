import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import InstitutionStats from '@/components/institution/InstitutionStats';
import PerformanceMetrics from '@/components/institution/PerformanceMetrics';
import InstitutionCoursesTable from '@/components/institution/InstitutionCoursesTable';
import InstitutionQuickActions from '@/components/institution/InstitutionQuickActions';
import RecentEnrollments from '@/components/institution/RecentEnrollments';
import InstitutionInstructors from '@/components/institution/InstitutionInstructors';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentEnrollments: [],
    performanceData: {},
    topCourses: [],
    instructors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.userId) {
          throw new Error('Usuário instituição não identificado');
        }

        setLoading(true);
        setError(null);

        const [statsRes, enrollmentsRes, instructorsRes] = await Promise.all([
          api.get(`/institution/${user.userId}/stats`),
          api.get(`/institution/${user.userId}/recent-enrollments`),
          api.get(`/institution/${user.userId}/instructors`)
        ]);

        setDashboardData({
          stats: statsRes.data,
          recentEnrollments: enrollmentsRes.data,
          performanceData: statsRes.data.performance || {},
          topCourses: statsRes.data.topCourses || [],
          instructors: instructorsRes.data || []
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
        toast.error('Falha ao carregar dados', {
          description: error.response?.data?.message || 'Tente novamente mais tarde'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">
            Nenhuma instituição autenticada
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Faça login para acessar o dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <InstitutionStats stats={dashboardData.stats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Primeira coluna - ocupa 2 colunas em xl */}
        <div className="xl:col-span-2 space-y-6">
          <PerformanceMetrics 
            data={dashboardData.performanceData} 
            courses={dashboardData.topCourses} 
          />
          <InstitutionCoursesTable 
            courses={dashboardData.topCourses} 
            institutionId={user.userId}
          />
        </div>

        {/* Segunda coluna */}
        <div className="space-y-6">
          <InstitutionQuickActions />
          <RecentEnrollments enrollments={dashboardData.recentEnrollments} />
        </div>

        {/* Terceira coluna */}
        <div className="space-y-6">
          <InstitutionInstructors 
            instructors={dashboardData.instructors} 
            stats={dashboardData.stats}
          />
        </div>
      </div>
    </div>
  );
}