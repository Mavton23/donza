import Icon from "../common/Icon";
import PropTypes from 'prop-types';

export default function StatCard({ title, value, icon, variant = 'default' }) {
  // Mapeamento de ícones e cores por tipo
  const iconConfig = {
    'courses-enrolled': { name: 'book-open', color: 'text-blue-500' },
    'courses-completed': { name: 'graduation-cap', color: 'text-green-500' },
    'learning-hours': { name: 'clock', color: 'text-purple-500' },
    'courses-taught': { name: 'presentation', color: 'text-indigo-500' },
    'students': { name: 'users', color: 'text-teal-500' },
    'average-rating': { name: 'star', color: 'text-yellow-500' },
    'achievements': { name: 'award', color: 'text-amber-500' },
    'last-active': { name: 'activity', color: 'text-rose-500' },
    [icon]: { name: icon, color: 'text-gray-500' }
  };

  // Configurações de variante
  const variants = {
    default: 'bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-md',
    minimal: 'bg-transparent border border-gray-200 dark:border-gray-700',
    colored: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800'
  };

  // Encontra a configuração do ícone ou usa o fallback
  const iconInfo = iconConfig[icon] || { name: icon, color: 'text-gray-500' };

  return (
    <div className={`rounded-xl p-5 transition-all hover:shadow-sm ${variants[variant]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${iconInfo.color.replace('text', 'bg')} bg-opacity-10`}>
          <Icon 
            name={iconInfo.name} 
            size="lg" 
            className={`${iconInfo.color}`} 
            strokeWidth={1.5}
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'minimal', 'colored'])
};