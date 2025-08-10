import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

export default function ExpertiseEditor({ expertise = [], onSave, showCourseManagement = false }) {
  const [items, setItems] = useState(expertise);
  const [newItem, setNewItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { show } = useNotification();

  useEffect(() => {
    setItems(expertise);
  }, [expertise]);

  const addItem = () => {
    if (!newItem.trim()) return;
    if (items.includes(newItem)) {
      show('warning', 'Esta especialidade já foi adicionada');
      return;
    }
    setItems(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (itemToRemove) => {
    setItems(prev => prev.filter(item => item !== itemToRemove));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(items);
      show('success', 'Especialidades atualizadas com sucesso');
    } catch (error) {
      show('error', 'Falha ao atualizar especialidades');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {showCourseManagement ? 'Gerenciar Cursos & Especialidades' : 'Suas Áreas de Especialização'}
        </h3>
        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={showCourseManagement ? 'Adicionar curso ou especialidade' : 'Adicionar área de especialização'}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <button
              onClick={addItem}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Adicionar
            </button>
          </div>
          
          {items.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, index) => (
                <div key={index} className="px-4 py-3 flex justify-between items-center">
                  <span className="text-gray-800 dark:text-gray-200">{item}</span>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : 'Salvar Especialidades'}
        </button>
      </div>
      
      {showCourseManagement && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Gerenciamento de Cursos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Os recursos de gerenciamento de cursos estarão disponíveis em breve. Aqui você poderá:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Criar e editar seus cursos</li>
            <li>Gerenciar matrículas de alunos</li>
            <li>Acompanhar o desempenho dos cursos</li>
          </ul>
        </div>
      )}
    </div>
  );
}