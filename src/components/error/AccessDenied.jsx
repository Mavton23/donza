import { Link } from 'react-router-dom';
import Icon from '../common/Icon';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <Icon name="lock" className="h-6 w-6 text-red-600 dark:text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Acesso Negado
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Você não tem permissão para acessar esta página. Por favor, entre em contato com o administrador.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center"
        >
          <Icon name="arrow-left" className="mr-2" />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}