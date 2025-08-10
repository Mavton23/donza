import { FiAlertTriangle, FiBook, FiCheckCircle } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';

export default function ModerationGuidelines({ guidelines }) {
  if (!guidelines || guidelines.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30 p-4">
        <div className="flex items-center text-yellow-800 dark:text-yellow-200">
          <FiAlertTriangle className="mr-2" />
          <span>Nenhuma diretriz do grupo definida ainda</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center">
        <FiBook className="text-blue-500 dark:text-blue-400 mr-2" />
        <h3 className="font-medium text-blue-800 dark:text-blue-200">Diretrizes do Grupo</h3>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {guidelines.map((guideline, index) => (
          <div key={index} className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FiCheckCircle className="text-green-500 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{guideline.title}</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {guideline.description}
                </p>
                {guideline.examples && guideline.examples.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Exemplos:
                    </span>
                    <div className="mt-1 space-y-1">
                      {guideline.examples.map((example, exIndex) => (
                        <div key={exIndex} className="flex">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">•</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {example}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {guideline.severity && (
                  <div className="mt-2">
                    <Badge 
                      className={
                        guideline.severity === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                          : guideline.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    >
                      {guideline.severity === 'high' 
                        ? 'Alta gravidade' 
                        : guideline.severity === 'medium'
                          ? 'Média gravidade'
                          : 'Baixa gravidade'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}