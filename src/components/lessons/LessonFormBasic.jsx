import { useEffect } from 'react';

export default function LessonFormBasic({ 
  lessonData, 
  setLessonData, 
  modules, 
  hasModuleId,
  isIndependent,
  toggleIndependent 
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLessonData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calcula a próxima ordem disponível se não estiver definida
  useEffect(() => {
    if (!hasModuleId && !isIndependent && modules.length > 0 && !lessonData.moduleId) {
      setLessonData(prev => ({ ...prev, moduleId: modules[0].moduleId }));
    }
  }, [modules, hasModuleId, isIndependent, lessonData.moduleId, setLessonData]);

  return (
    <div className="space-y-6">
      {/* Toggle para aula independente (apenas quando não vem de um módulo específico) */}
      {!hasModuleId && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="independent-lesson"
            checked={isIndependent}
            onChange={toggleIndependent}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
          />
          <label htmlFor="independent-lesson" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Criar aula independente (não faz parte de nenhum curso)
          </label>
        </div>
      )}

      {/* Seletor de módulo (apenas para aulas vinculadas) */}
      {!hasModuleId && !isIndependent && (
        <div>
          <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Módulo *
          </label>
          <select
            name="moduleId"
            id="moduleId"
            value={lessonData.moduleId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            required={!isIndependent}
          >
            {modules.map(module => (
              <option key={module.moduleId} value={module.moduleId}>
                {module.title} {module.course?.title && `(${module.course.title})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Título da aula (sempre visível) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Título da Aula *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={lessonData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          required
        />
      </div>

      {/* Tipo de aula (sempre visível) */}
      <div>
        <label htmlFor="lessonType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Aula *
        </label>
        <select
          name="lessonType"
          id="lessonType"
          value={lessonData.lessonType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          required
        >
          <option value="video">Aula em Vídeo</option>
          <option value="text">Aula em Texto</option>
          <option value="quiz">Questionário</option>
          <option value="assignment">Tarefa</option>
        </select>
      </div>

      {/* Ordem */}
      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ordem {!isIndependent && '*'}
        </label>
        <input
          type="number"
          name="order"
          id="order"
          min="0"
          value={lessonData.order}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          required={!isIndependent}
        />
        {isIndependent && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Opcional para aulas independentes
          </p>
        )}
      </div>
    </div>
  );
}