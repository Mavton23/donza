import { useState, useEffect } from 'react';
import { FiX, FiClock, FiCheck } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';

export default function TopicSelector({ 
  currentTopic,
  topicHistory,
  onSetTopic,
  onClose,
  isLeader
}) {
  const [newTopic, setNewTopic] = useState('');
  const [selectedHistoryTopic, setSelectedHistoryTopic] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      toast.warning('Digite um tópico válido');
      return;
    }
    onSetTopic(newTopic);
    onClose();
  };

  const handleUseHistoryTopic = (topic) => {
    setNewTopic(topic);
    setSelectedHistoryTopic(topic);
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Dialog.Title className="text-lg font-medium">
          {currentTopic ? 'Alterar Tópico' : 'Definir Tópico'}
        </Dialog.Title>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <FiX size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Novo Tópico
          </label>
          <input
            id="topic"
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Qual será o tópico do debate?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength={5}
          />
        </div>
        
        {isLeader && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Histórico de Tópicos
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {topicHistory.length > 0 ? (
                topicHistory.map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => handleUseHistoryTopic(item.topic)}
                    className={`p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedHistoryTopic === item.topic
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{item.topic}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <FiClock className="inline mr-1" />
                          {new Date(item.changedAt).toLocaleString()}
                        </div>
                      </div>
                      {selectedHistoryTopic === item.topic && (
                        <FiCheck className="text-indigo-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Nenhum tópico anterior encontrado
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Confirmar Tópico
          </button>
        </div>
      </form>
    </div>
  );
}