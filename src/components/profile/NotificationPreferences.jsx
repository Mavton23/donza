import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const defaultPreferences = {
  email: {
    eventReminders: true,
    taskDeadlines: true,
    newMessages: true,
    courseUpdates: false,
    reviewReplies: true
  },
  inApp: true
};

export default function NotificationPreferences({ preferences = defaultPreferences, onSave }) {
  const [settings, setSettings] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    setSettings(preferences);
  }, [preferences]);

  const handleToggle = (type, key) => {
    if (type === 'inApp') {
      setSettings(prev => ({
        ...prev,
        inApp: !prev.inApp
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          [key]: !prev.email[key]
        }
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(settings);
      showNotification('success', 'Preferências de notificação atualizadas');
    } catch (error) {
      showNotification('error', 'Falha ao atualizar preferências');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Preferências de Notificação
      </h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Notificações por Email
          </h4>
          <div className="space-y-3">
            {Object.entries(settings.email).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {formatPreferenceLabel(key)}
                </span>
                <button
                  onClick={() => handleToggle('email', key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Notificações no Aplicativo
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Ativar todas as notificações no app
            </span>
            <button
              onClick={() => handleToggle('inApp')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                settings.inApp ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.inApp ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}

function formatPreferenceLabel(key) {
  const labels = {
    eventReminders: 'Lembretes de Eventos',
    taskDeadlines: 'Prazos de Tarefas',
    newMessages: 'Novas Mensagens',
    courseUpdates: 'Atualizações de Cursos',
    reviewReplies: 'Respostas a Avaliações'
  };
  return labels[key] || key;
}