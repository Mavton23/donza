import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../common/Icon';

export default function RoleSelectionStep({ onSelect, initialRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const roles = [
    {
      id: 'student',
      title: 'Estudante',
      description: 'Participe de cursos e expanda seu conhecimento',
      icon: 'graduation-cap',
      color: 'text-blue-500'
    },
    {
      id: 'instructor',
      title: 'Instrutor',
      description: 'Crie e gerencie conteúdo educacional',
      icon: 'presentation',
      color: 'text-indigo-500',
      highlight: true
    },
    {
      id: 'institution',
      title: 'Instituição',
      description: 'Gerencie múltiplos instrutores e cursos',
      icon: 'school',
      color: 'text-purple-500'
    }
  ];

  const handleRoleSelect = (roleId) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('as', roleId);
    
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    onSelect(roleId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Junte-se à Nossa Plataforma
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Selecione seu tipo de conta para começar
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              onClick={() => handleRoleSelect(role.id)}
              className={`p-5 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                initialRole === role.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700'
                  : 'border-gray-200 hover:border-indigo-300 dark:border-gray-600 dark:hover:border-indigo-500/50'
              } ${
                role.highlight ? 'ring-2 ring-indigo-200 dark:ring-indigo-500/30' : ''
              }`}
            >
              <div className={`p-3 rounded-lg ${role.color.replace('text', 'bg')} bg-opacity-10`}>
                <Icon 
                  name={role.icon} 
                  size="lg" 
                  className={`${role.color}`}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{role.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Já tem uma conta?{' '}
        <Link 
          to="/signin" 
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Entrar
        </Link>
      </div>
    </motion.div>
  );
}