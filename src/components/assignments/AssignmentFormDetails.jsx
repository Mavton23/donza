import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AssignmentFormDetails({ assignmentData, setAssignmentData }) {
  const [newRubricItem, setNewRubricItem] = useState({
    criterion: '',
    points: 0,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setAssignmentData(prev => ({
      ...prev,
      dueDate: date
    }));
  };

  const handleAddRubricItem = () => {
    if (newRubricItem.criterion && newRubricItem.description) {
      setAssignmentData(prev => ({
        ...prev,
        rubric: [...prev.rubric, {
          ...newRubricItem,
          points: Number(newRubricItem.points) || 0
        }]
      }));
      setNewRubricItem({
        criterion: '',
        points: 0,
        description: ''
      });
    }
  };

  const handleRemoveRubricItem = (index) => {
    setAssignmentData(prev => ({
      ...prev,
      rubric: prev.rubric.filter((_, i) => i !== index)
    }));
  };

  const handleLateSubmissionToggle = (e) => {
    const { checked } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      allowLateSubmissions: checked,
      latePenalty: checked ? prev.latePenalty : 0
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data de Vencimento (Opcional)
          </label>
          <DatePicker
            selected={assignmentData.dueDate ? new Date(assignmentData.dueDate) : null}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            placeholderText="Selecione data e hora de vencimento"
          />
        </div>

        <div>
          <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pontuação Máxima
          </label>
          <input
            type="number"
            name="maxScore"
            id="maxScore"
            min="1"
            value={assignmentData.maxScore}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="submissionFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Formato de Submissão
          </label>
          <select
            name="submissionFormat"
            id="submissionFormat"
            value={assignmentData.submissionFormat}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          >
            <option value="text">Apenas Texto</option>
            <option value="file">Upload de Arquivo</option>
            <option value="both">Texto e Arquivo</option>
          </select>
        </div>

        {assignmentData.submissionFormat !== 'text' && (
          <div>
            <label htmlFor="allowedFileTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipos de Arquivo Permitidos
            </label>
            <select
              name="allowedFileTypes"
              id="allowedFileTypes"
              multiple
              value={assignmentData.allowedFileTypes}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setAssignmentData(prev => ({
                  ...prev,
                  allowedFileTypes: options
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="zip">Arquivo ZIP</option>
              <option value="jpg">Imagem JPEG</option>
              <option value="png">Imagem PNG</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Mantenha Ctrl/Cmd pressionado para selecionar múltiplos tipos
            </p>
          </div>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="allowLateSubmissions"
            name="allowLateSubmissions"
            type="checkbox"
            checked={assignmentData.allowLateSubmissions}
            onChange={handleLateSubmissionToggle}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="allowLateSubmissions" className="font-medium text-gray-700 dark:text-gray-300">
            Permitir Submissões Tardias
          </label>
        </div>
      </div>

      {assignmentData.allowLateSubmissions && (
        <div>
          <label htmlFor="latePenalty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Penalidade por Atraso (% por dia)
          </label>
          <input
            type="number"
            name="latePenalty"
            id="latePenalty"
            min="0"
            max="100"
            step="0.1"
            value={assignmentData.latePenalty}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500">
            Percentual de pontos deduzidos por dia de atraso (ex: 10 = 10% por dia)
          </p>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rubrica de Avaliação
        </label>
        
        {assignmentData.rubric.length > 0 && (
          <div className="mb-4 space-y-3">
            {assignmentData.rubric.map((item, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">
                      {item.criterion}
                    </span>
                    <span className="text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded">
                      {item.points} pts
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRubricItem(index)}
                  className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adicionar Item à Rubrica</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="rubricCriterion" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Critério *
              </label>
              <input
                type="text"
                id="rubricCriterion"
                value={newRubricItem.criterion}
                onChange={(e) => setNewRubricItem(prev => ({ ...prev, criterion: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rubricPoints" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pontos *
              </label>
              <input
                type="number"
                id="rubricPoints"
                min="0"
                step="0.5"
                value={newRubricItem.points}
                onChange={(e) => setNewRubricItem(prev => ({ ...prev, points: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="rubricDescription" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                id="rubricDescription"
                value={newRubricItem.description}
                onChange={(e) => setNewRubricItem(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAddRubricItem}
            disabled={!newRubricItem.criterion || !newRubricItem.description}
            className="mt-3 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Adicionar à Rubrica
          </button>
        </div>
      </div>
    </div>
  );
}