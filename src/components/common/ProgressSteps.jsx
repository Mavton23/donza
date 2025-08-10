import React from 'react';
import PropTypes from 'prop-types';

const ProgressSteps = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Linha de fundo */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
        
        {/* Linha de progresso ativa */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 -translate-y-1/2 z-10 transition-all duration-300 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
          }}
        ></div>
        
        {/* Passos individuais */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep - 1;
          const isActive = index === currentStep - 1;
          const stepNumber = index + 1;
          
          return (
            <div key={index} className="relative z-20 flex flex-col items-center">
              {/* Círculo do passo */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isActive ? 'bg-indigo-600 dark:bg-indigo-500 border-2 border-indigo-600 dark:border-indigo-500' : ''}
                ${isCompleted ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'}
                transition-colors duration-300 ease-in-out
              `}>
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stepNumber}
                  </span>
                )}
              </div>
              
              {/* Label do passo */}
              <span className={`
                mt-2 text-xs font-medium text-center
                ${isActive || isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                transition-colors duration-300 ease-in-out
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProgressSteps.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentStep: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default ProgressSteps;