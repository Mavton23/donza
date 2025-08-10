import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { toast } from 'sonner';

export default function MessagePreferences({ preferences, onSave, role }) {
  const [settings, setSettings] = useState(preferences || {
    allowAttachments: false,
    courseRelatedOnly: true,
    dailyMessageLimit: 5,
    acceptsMessagesFromAll: false,
    acceptsMessagesFromStudents: false
  });

  const handleSave = () => {
    onSave(settings);
    toast.success('Preferências de mensagem atualizadas');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Preferências de Mensagem</h3>
      
      <div className="space-y-4">
        {role === 'instructor' && (
          <>
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
                  Aceitar mensagens de qualquer estudante
                </Switch.Label>
                <Switch
                  checked={settings.acceptsMessagesFromStudents}
                  onChange={(value) => setSettings({...settings, acceptsMessagesFromStudents: value})}
                  className={`${
                    settings.acceptsMessagesFromStudents ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.acceptsMessagesFromStudents ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
              <Switch.Description className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Se desativado, só receberá mensagens de estudantes matriculados em seus cursos
              </Switch.Description>
            </Switch.Group>

            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
                  Restringir a mensagens relacionadas a cursos
                </Switch.Label>
                <Switch
                  checked={settings.courseRelatedOnly}
                  onChange={(value) => setSettings({...settings, courseRelatedOnly: value})}
                  className={`${
                    settings.courseRelatedOnly ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      settings.courseRelatedOnly ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </>
        )}

        {role === 'student' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Limite diário de mensagens
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.dailyMessageLimit}
              onChange={(e) => setSettings({...settings, dailyMessageLimit: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>5 (padrão)</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Atual: {settings.dailyMessageLimit} mensagens por dia
            </p>
          </div>
        )}

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
              Permitir anexos em mensagens
            </Switch.Label>
            <Switch
              checked={settings.allowAttachments}
              onChange={(value) => setSettings({...settings, allowAttachments: value})}
              className={`${
                settings.allowAttachments ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${
                  settings.allowAttachments ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
}