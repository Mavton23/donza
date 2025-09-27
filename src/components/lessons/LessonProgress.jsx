import { useState } from 'react';
import { CheckCircle, Clock, Target } from 'lucide-react';

export default function LessonProgress({ progress, onProgressUpdate }) {
  const [isManualUpdate, setIsManualUpdate] = useState(false);

  const handleManualProgressUpdate = () => {
    if (progress < 100) {
      const newProgress = progress === 100 ? 100 : 100;
      onProgressUpdate(newProgress);
      setIsManualUpdate(true);
      
      // Resetar após 2 segundos
      setTimeout(() => setIsManualUpdate(false), 2000);
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    if (progress < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getProgressMessage = (progress) => {
    if (progress === 0) return 'Aula não iniciada';
    if (progress < 30) return 'Iniciando...';
    if (progress < 70) return 'Em progresso';
    if (progress < 100) return 'Quase lá!';
    return 'Aula concluída!';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-600" />
          Seu Progresso
        </h3>
        
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress Message */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {getProgressMessage(progress)}
        </span>
        
        {progress === 100 && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Concluído
          </span>
        )}
      </div>

      {/* Manual Completion Button */}
      {progress < 100 && (
        <div className="text-center">
          <button
            onClick={handleManualProgressUpdate}
            disabled={isManualUpdate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isManualUpdate ? 'Salvando...' : 'Marcar como concluído'}
          </button>
          
          {progress > 0 && progress < 100 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              O progresso é salvo automaticamente enquanto você assiste
            </p>
          )}
        </div>
      )}

      {/* Completion Celebration */}
      {progress === 100 && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
            Parabéns!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Você completou esta aula com sucesso
          </p>
        </div>
      )}
    </div>
  );
}