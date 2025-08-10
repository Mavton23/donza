import { useState } from 'react';
import { Switch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NotificationPreferences({ preferences, onUpdate }) {
  const [formData, setFormData] = useState(preferences || {
    email: true,
    push: true,
    inApp: true,
    courseUpdates: true,
    eventReminders: true,
    communityActivity: true,
    privateMessages: true
  });

  const handleChange = (field) => {
    const updated = { ...formData, [field]: !formData[field] };
    setFormData(updated);
    onUpdate(updated);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Preferências de Notificação
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Controle como e quando você recebe notificações
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Métodos de Recebimento
            </h4>
            <div className="space-y-4">
              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    E-mail
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Receber notificações por e-mail
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.email}
                  onChange={() => handleChange('email')}
                  className={classNames(
                    formData.email ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.email ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Notificações Push
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Receber notificações no dispositivo
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.push}
                  onChange={() => handleChange('push')}
                  className={classNames(
                    formData.push ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.push ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Notificações na Plataforma
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Mostrar notificações no sistema de notificações
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.inApp}
                  onChange={() => handleChange('inApp')}
                  className={classNames(
                    formData.inApp ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.inApp ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Tipos de Notificação
            </h4>
            <div className="space-y-4">
              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Atualizações de Cursos
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Novos materiais, atividades e anúncios
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.courseUpdates}
                  onChange={() => handleChange('courseUpdates')}
                  className={classNames(
                    formData.courseUpdates ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.courseUpdates ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Lembretes de Eventos
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Lembretes de eventos agendados
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.eventReminders}
                  onChange={() => handleChange('eventReminders')}
                  className={classNames(
                    formData.eventReminders ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.eventReminders ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Atividade em Comunidades
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Novas postagens e interações em comunidades
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.communityActivity}
                  onChange={() => handleChange('communityActivity')}
                  className={classNames(
                    formData.communityActivity ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.communityActivity ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                    Mensagens Privadas
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Notificações de novas mensagens
                  </Switch.Description>
                </span>
                <Switch
                  checked={formData.privateMessages}
                  onChange={() => handleChange('privateMessages')}
                  className={classNames(
                    formData.privateMessages ? 'bg-indigo-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      formData.privateMessages ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}