import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, BookOpen, Users, HelpCircle } from 'lucide-react';
import UserSearch from './UserSearch';
import CourseSearch from './CourseSearch';

export default function ContextSelector({ onClose, onSubmit, user, existingConversations }) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState({
    type: '',
    id: '',
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
          return sameContext && sameParticipants && conv.contextId === context.id;
        }
        
        return sameContext && sameParticipants;
      });
      
      setExistingConvs(filtered);
    }
  }, [context.type, context.recipientId, context.id, existingConversations]);

  const handleSubmit = () => {
    if (!context.message.trim()) {
      return alert('Message is required');
    }
    
    if (existingConvs?.length > 0) {
      onSubmit({
        ...context,
        conversationId: existingConvs[0].conversationId,
        useExisting: true
      });
    } else {
      onSubmit(context);
    }
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
                    {step === 1 ? 'Select Context' : 'Compose Message'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose how you want to start this conversation
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
                            <h4 className="font-medium text-gray-900 dark:text-white">Course Related</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Message an instructor about a specific course
                            </p>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setContext({ ...context, type: 'direct' });
                          setStep(2);
                        }}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Users className="mr-3 text-indigo-600" size={20} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Direct Message</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Start a private conversation
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
                            <h4 className="font-medium text-gray-900 dark:text-white">Support Ticket</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Contact institution support
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
                            id: course.courseId,
                            recipientId: course.instructorId
                          });
                        }}
                      />
                    )}

                    {context.type === 'direct' && (
                      <UserSearch 
                        onSelect={(user) => {
                          setContext({
                            ...context,
                            recipientId: user.userId
                          });
                        }}
                        currentUserRole={user.role}
                      />
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        value={context.message}
                        onChange={(e) => setContext({ ...context, message: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Type your message here..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!context.recipientId || !context.message.trim()}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        Send Message
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