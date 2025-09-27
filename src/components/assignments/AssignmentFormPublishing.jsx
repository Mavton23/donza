export default function AssignmentFormPublishing({ assignmentData, setAssignmentData }) {
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={assignmentData.isPublished}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isPublished" className="font-medium text-gray-700 dark:text-gray-300">
            Publicar Imediatamente
          </label>
          <p className="text-gray-500 dark:text-gray-400">
            Tornar esta tarefa visível para os estudantes imediatamente. Se desmarcado, a tarefa será salva como rascunho.
          </p>
        </div>
      </div>

      {assignmentData.isPublished && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Aviso de Publicação
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Uma vez publicada, os estudantes matriculados no curso poderão visualizar e enviar trabalhos para esta tarefa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}