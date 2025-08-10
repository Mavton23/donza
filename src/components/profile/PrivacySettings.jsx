import { useState } from 'react';
import { Lock, Globe, Check, X } from 'lucide-react';

export default function PrivacySettings({ isPrivate, onPrivacyChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newPrivacy, setNewPrivacy] = useState(isPrivate);

  const handlePrivacyChange = async () => {
    setIsUpdating(true);
    try {
      await onPrivacyChange(newPrivacy);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to update privacy:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Configurações de Privacidade
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center">
            {isPrivate ? (
              <Lock className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
            ) : (
              <Globe className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isPrivate ? 'Perfil Privado' : 'Perfil Público'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPrivate 
                  ? 'Somente você pode ver seu perfil' 
                  : 'Qualquer pessoa pode ver seu perfil'}
              </p>
            </div>
          </div>
          
          {!showConfirmation ? (
            <button
              onClick={() => {
                setNewPrivacy(!isPrivate);
                setShowConfirmation(true);
              }}
              disabled={isUpdating}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Alterar
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handlePrivacyChange}
                disabled={isUpdating}
                className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            {isPrivate ? 'Perfil Privado' : 'Perfil Público'} significa:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {isPrivate ? (
              <>
                <li>• Seu perfil não aparece em buscas</li>
                <li>• Outros usuários não podem ver suas informações</li>
                <li>• Seus cursos/atividades não são visíveis publicamente</li>
              </>
            ) : (
              <>
                <li>• Seu perfil aparece em buscas</li>
                <li>• Outros usuários podem ver suas informações públicas</li>
                <li>• Seus cursos/atividades são visíveis</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}