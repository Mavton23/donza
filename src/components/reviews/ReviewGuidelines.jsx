import React from 'react';
import PropTypes from 'prop-types';

const ReviewGuidelines = ({ isInstructor }) => {
  const instructorGuidelines = [
    'Seja profissional e construtivo',
    'Aborde pontos específicos da avaliação',
    'Agradeça o feedback dos alunos'
  ];

  const studentGuidelines = [
    'Compartilhe sua experiência honesta',
    'Foque no conteúdo e na instrução',
    'Evite ataques pessoais'
  ];

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {isInstructor ? 'Diretrizes para Respostas' : 'Diretrizes para Avaliações'}
      </h3>
      <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        {(isInstructor ? instructorGuidelines : studentGuidelines).map((guideline, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

ReviewGuidelines.propTypes = {
  isInstructor: PropTypes.bool
};

ReviewGuidelines.defaultProps = {
  isInstructor: false
};

export default ReviewGuidelines;