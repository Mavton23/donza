import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const defaultInterests = [
  'Programação', 'Design', 'Negócios', 'Marketing', 
  'Fotografia', 'Música', 'Saúde', 'Fitness',
  'Ciência de Dados', 'Inteligência Artificial', 'Blockchain',
  'Idiomas', 'Escrita', 'Desenvolvimento Pessoal'
];

export default function InterestsSelector({ selectedInterests = [], onSave }) {
  const [interests, setInterests] = useState(selectedInterests);
  const [customInterest, setCustomInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { show } = useNotification();

  useEffect(() => {
    setInterests(selectedInterests);
  }, [selectedInterests]);

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    if (interests.includes(customInterest)) {
      show('warning', 'Este interesse já foi adicionado');
      return;
    }
    setInterests(prev => [...prev, customInterest.trim()]);
    setCustomInterest('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(interests);
      show('success', 'Interesses atualizados com sucesso');
    } catch (error) {
      show('error', 'Falha ao atualizar interesses');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Selecione Seus Interesses
      </h3>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {defaultInterests.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                interests.includes(interest)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Adicionar interesse personalizado"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
          />
          <button
            onClick={addCustomInterest}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      {interests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seus Interesses Selecionados ({interests.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <span
                key={interest}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full text-sm flex items-center"
              >
                {interest}
                <button
                  onClick={() => toggleInterest(interest)}
                  className="ml-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Salvando...' : 'Salvar Interesses'}
      </button>
    </div>
  );
}