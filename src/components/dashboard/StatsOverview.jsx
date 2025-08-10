import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  Building2,
  GraduationCap,
  BarChart2,
  UserCheck,
  Calendar
} from 'lucide-react';

const StatCard = ({ icon, title, value, change, isPositive, description }) => {
  const Icon = icon;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start">
          <div className="p-3 rounded-lg bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-grow">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </p>
              {change !== undefined && (
                <span className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StatsOverview({ stats, role }) {
  // Métricas para estudantes
  const studentStats = [
    {
      icon: BookOpen,
      title: 'Cursos Matriculados',
      value: stats.coursesEnrolled || 0,
      change: stats.coursesEnrolledChange,
      isPositive: stats.coursesEnrolledChange >= 0,
      description: 'Total de cursos em andamento'
    },
    {
      icon: Clock,
      title: 'Horas de Aprendizado',
      value: stats.learningHours || 0,
      change: stats.learningHoursChange,
      isPositive: stats.learningHoursChange >= 0,
      description: 'Tempo total investido'
    },
    {
      icon: Award,
      title: 'Certificados',
      value: stats.certificatesEarned || 0,
      change: stats.certificatesEarnedChange,
      isPositive: stats.certificatesEarnedChange >= 0,
      description: 'Conquistas obtidas'
    },
    {
      icon: TrendingUp,
      title: 'Taxa de Conclusão',
      value: `${stats.completionRate || 0}%`,
      change: stats.completionRateChange,
      isPositive: stats.completionRateChange >= 0,
      description: 'Cursos completados'
    }
  ];

  // Métricas para instrutores
  const instructorStats = [
    {
      icon: BookOpen,
      title: 'Cursos Publicados',
      value: stats.activeCourses || 0,
      change: stats.coursesCreatedChange,
      isPositive: stats.coursesCreatedChange >= 0,
      description: 'Seus cursos ativos'
    },
    {
      icon: Users,
      title: 'Alunos',
      value: stats.totalStudents || 0,
      change: stats.studentsChange,
      isPositive: stats.studentsChange >= 0,
      description: 'Total de estudantes'
    },
    {
      icon: BarChart2,
      title: 'Avaliação Média',
      value: stats.averageRating?.toFixed(1) || '0.0',
      change: stats.ratingChange,
      isPositive: stats.ratingChange >= 0,
      description: 'Sua média de avaliações'
    },
    {
      icon: UserCheck,
      title: 'Taxa de Conclusão',
      value: `${stats.completionRate || 0}%`,
      change: stats.completionRateChange,
      isPositive: stats.completionRateChange >= 0,
      description: 'Média dos seus cursos'
    }
  ];

  // Métricas para instituições
  const institutionStats = [
    {
      icon: Building2,
      title: 'Cursos Oferecidos',
      value: stats.publishedCourses || 0,
      change: stats.coursesChange,
      isPositive: stats.coursesChange >= 0,
      description: 'Total de cursos publicados'
    },
    {
      icon: GraduationCap,
      title: 'Alunos Ativos',
      value: stats.activeStudents || 0,
      change: stats.studentsChange,
      isPositive: stats.studentsChange >= 0,
      description: 'Estudantes matriculados'
    },
    {
      icon: Users,
      title: 'Instrutores',
      value: stats.totalInstructors || 0,
      change: stats.instructorsChange,
      isPositive: stats.instructorsChange >= 0,
      description: 'Professores associados'
    },
    {
      icon: Calendar,
      title: 'Eventos Ativos',
      value: stats.upcomingEvents || 0,
      change: stats.eventsChange,
      isPositive: stats.eventsChange >= 0,
      description: 'Eventos programados'
    }
  ];

  // Métricas para administradores
  const adminStats = [
    {
      icon: Users,
      title: 'Usuários Ativos',
      value: stats.totalUsers || 0,
      change: stats.usersChange,
      isPositive: stats.usersChange >= 0,
      description: 'Total de usuários'
    },
    {
      icon: BookOpen,
      title: 'Cursos Publicados',
      value: stats.totalCourses || 0,
      change: stats.coursesChange,
      isPositive: stats.coursesChange >= 0,
      description: 'No sistema'
    },
    {
      icon: Building2,
      title: 'Instituições',
      value: stats.totalInstitutions || 0,
      change: stats.institutionsChange,
      isPositive: stats.institutionsChange >= 0,
      description: 'Cadastradas'
    },
    {
      icon: Calendar,
      title: 'Eventos Ativos',
      value: stats.activeEvents || 0,
      change: stats.eventsChange,
      isPositive: stats.eventsChange >= 0,
      description: 'Em andamento'
    }
  ];

  // Seleciona as estatísticas baseadas no role
  const statsToShow = {
    student: studentStats,
    instructor: instructorStats,
    institution: institutionStats,
    admin: adminStats
  }[role] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat, index) => (
        <StatCard key={`stat-${index}`} {...stat} />
      ))}
    </div>
  );
}