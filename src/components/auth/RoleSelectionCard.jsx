const RoleSelectionCard = ({ 
    title, 
    description, 
    icon, 
    selected, 
    highlight, 
    onClick 
  }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-6 rounded-lg border transition-all duration-200 ${
          selected 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
        } ${
          highlight ? 'ring-2 ring-indigo-300 dark:ring-indigo-500' : ''
        }`}
      >
        <div className="flex items-start">
          <span className="text-2xl mr-4">{icon}</span>
          <div>
            <h3 className={`text-lg font-medium ${
              selected 
                ? 'text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-800 dark:text-gray-200'
            }`}>
              {title}
            </h3>
            <p className={`mt-1 ${
              selected 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {description}
            </p>
          </div>
        </div>
      </button>
    );
  };
  
  export default RoleSelectionCard;