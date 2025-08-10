import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../ui/button';

/**
 * Componente para exibir erros com opção de tentar novamente
 * @param {Object} props
 * @param {string} props.message - Mensagem de erro
 * @param {function} [props.onRetry] - Função para tentar novamente
 * @param {string} [props.className] - Classes adicionais
 */
export default function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <FiAlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mb-3" />
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Oops, something went wrong
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {message || 'An unexpected error occurred'}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            size="sm"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}