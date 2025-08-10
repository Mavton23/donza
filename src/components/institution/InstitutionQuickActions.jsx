import { Link } from 'react-router-dom';
import { 
  Users,
  BookOpen,
  BarChart2,
  Mail,
  Plus,
  FileText,
  CreditCard,
  Settings,
  Calendar,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function InstitutionQuickActions() {
  const { user } = useAuth();
  
  const quickActions = [
    {
      icon: Plus,
      title: 'Novo Curso Institucional',
      description: 'Crie um curso com selo da sua instituição',
      link: '/institution/courses/new',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    {
      icon: Users,
      title: 'Gerenciar Instrutores',
      description: 'Adicione ou remova membros da equipe',
      link: '/institution/instructors',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    },
    {
      icon: Mail,
      title: 'Enviar Anúncio',
      description: 'Comunique-se com todos os alunos',
      link: '/institution/announcements/new',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      icon: BarChart2,
      title: 'Relatório de Desempenho',
      description: 'Métricas institucionais detalhadas',
      link: '/institution/analytics',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ];

  const resources = [
    {
      icon: FileText,
      title: 'Modelos de Certificado',
      link: '/institution/resources/certificates'
    },
    {
      icon: Calendar,
      title: 'Calendário Acadêmico',
      link: '/institution/resources/calendar'
    },
    {
      icon: Download,
      title: 'Materiais de Divulgação',
      link: '/institution/resources/marketing'
    },
    {
      icon: Settings,
      title: 'Configurações Institucionais',
      link: '/institution/settings'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Ações Rápidas
          </h2>
          {user?.institution?.plan === 'premium' && (
            <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
              Conta Premium
            </span>
          )}
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} p-3 rounded-lg hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{action.title}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Resources Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Recursos Institucionais
          </h3>
          <div className="space-y-2">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={index}
                  to={resource.link}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 -mx-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Icon className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                  {resource.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Billing for Premium */}
        {user?.institution?.plan === 'premium' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/institution/billing"
              className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span>Gerenciar Assinatura</span>
              <CreditCard className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}