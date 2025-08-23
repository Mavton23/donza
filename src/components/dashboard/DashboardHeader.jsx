import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';

export default function DashboardHeader({ user }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const roleDescription = {
    student: 'Pronto para aprender algo novo hoje?',
    instructor: user.status === 'pending' 
      ? 'Seu perfil está em análise. Você será notificado quando for aprovado.'
      : 'Seu conhecimento está transformando vidas',
    institution: user.status === 'pending'
      ? 'Sua instituição está em análise. Você será notificado quando for aprovada.'
      : 'Gerencie sua plataforma educacional',
    admin: 'Painel de administração'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center">
          <Avatar 
           user={user}
            size="lg"
            className="border-4 border-white dark:border-gray-800"
          />
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-white">
              {greeting()}, {user.username?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-indigo-100 dark:text-gray-300">
              {roleDescription[user.role]}
            </p>
            {['instructor', 'institution'].includes(user.role) && user.status === 'pending' && (
              <div className="mt-2 flex items-center text-yellow-200">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Análise em andamento</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to={user.role === 'student' ? '/learning/courses' : '/instructor/courses'}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              ['instructor', 'institution'].includes(user.role) && user.status === 'pending'
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'text-white bg-custom-primary hover:bg-custom-primary-hover'
            }`}
            onClick={(e) => {
              if (['instructor', 'institution'].includes(user.role) && user.status === 'pending') {
                e.preventDefault();
              }
            }}
          >
            {user.role === 'student' ? 'Ver meus cursos' : 'Gerenciar cursos'}
          </Link>
        </div>
      </div>
    </div>
  );
}