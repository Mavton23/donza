import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, BookOpen, Users, HelpCircle } from 'lucide-react';
import UserSearch from './UserSearch';
import CourseSearch from './CourseSearch';

export default function ContextSelector({ onClose, onSubmit, user, existingConversations }) {
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [context, setContext] = useState({
    type: '',
    conversationId: '',
    recipientId: '',
    message: ''
  });
  const [existingConvs, setExistingConvs] = useState([]);

  useEffect(() => {
    if (context.type && context.recipientId) {
      const filtered = existingConversations?.filter(conv => {
        const sameContext = conv.contextType === context.type;
        const sameParticipants = conv.participants.some(p => p.userId === context.recipientId);
        
        if (context.type === 'course') {
          return sameContext && sameParticipants && conv.contextId === context.conversationId;
        }
        
        return sameContext && sameParticipants;
      });
      
      setExistingConvs(filtered);
    }
  }, [context.type, context.recipientId, context.conversationId, existingConversations]);

  // Atualiza o context quando o usuário é selecionado
  useEffect(() => {
    if (selectedUser) {
      setContext(prev => ({
        ...prev,
        recipientId: selectedUser.userId
      }));
    }
  }, [selectedUser]);

  const handleSubmit = () => {
    if (!context.message.trim()) {
      return alert('A mensagem é obrigatória');
    }
    
    if (existingConvs?.length > 0) {
      onSubmit({
        ...context,
        conversationId: existingConvs[0].conversationId,
        useExisting: true
      });
    } else {
      onSubmit({
        ...context,
        useExisting: true
      });
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setSelectedUser(null); // Limpa a seleção ao voltar
    setContext({
      type: '',
      conversationId: '',
      recipientId: '',
      message: ''
    });
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    {step === 1 ? 'Selecionar Contexto' : 'Compor Mensagem'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Escolha como deseja iniciar esta conversa
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                      {user.role === 'student' && (
                        <button
                          onClick={() => {
                            setContext({ ...context, type: 'course' });
                            setStep(2);
                          }}
                          className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <BookOpen className="mr-3 text-indigo-600" size={20} />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Relacionado ao Curso</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Envie uma mensagem para um instrutor sobre um curso específico
                            </p>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setContext({ ...context, type: 'conversation' });
                          setStep(2);
                        }}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Users className="mr-3 text-indigo-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Mensagem Direta</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Inicie uma conversa privada
                          </p>
                        </div>
                      </button>

                      {user.role === 'student' && (
                        <button
                          onClick={() => {
                            setContext({ ...context, type: 'support', isTicket: true });
                            setStep(2);
                          }}
                          className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <HelpCircle className="mr-3 text-indigo-600" size={20} />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Ticket de Suporte</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Entre em contato com o suporte da instituição
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {context.type === 'course' && (
                      <CourseSearch 
                        onSelect={(course) => {
                          setContext({
                            ...context,
                            conversationId: course.courseId,
                            recipientId: course.instructorId
                          });
                        }}
                      />
                    )}

                    {context.type === 'conversation' && (
                      <UserSearch 
                        onSelect={setSelectedUser}
                        selectedUser={selectedUser}
                        onClearSelection={() => setSelectedUser(null)}
                        currentUserRole={user.role}
                      />
                    )}

                    {context.type === 'support' && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Sua mensagem será enviada para a equipe de suporte da instituição.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mensagem
                      </label>
                      <textarea
                        value={context.message}
                        onChange={(e) => setContext({ ...context, message: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Digite sua mensagem aqui..."
                      />
                    </div>

                    {/* Mostrar conversas existentes */}
                    {existingConvs.length > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ Você já tem uma conversa existente com este usuário. 
                          A mensagem será adicionada à conversa existente.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={handleBackToStep1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={
                          !context.message.trim() || 
                          (context.type === 'conversation' && !selectedUser) ||
                          (context.type === 'course' && !context.conversationId)
                        }
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        Enviar Mensagem
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}