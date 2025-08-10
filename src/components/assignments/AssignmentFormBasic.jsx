import { useEffect } from 'react';

export default function AssignmentFormBasic({ assignmentData, setAssignmentData, modules, lessons }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Atualiza lessons quando moduleId muda
  useEffect(() => {
    if (assignmentData.moduleId) {
      setAssignmentData(prev => ({
        ...prev,
        lessonId: ''
      }));
    }
  }, [assignmentData.moduleId, setAssignmentData]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Assignment Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={assignmentData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={assignmentData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          required
        />
      </div>

      {modules.length > 0 && (
        <div>
          <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Module (Optional)
          </label>
          <select
            name="moduleId"
            id="moduleId"
            value={assignmentData.moduleId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          >
            <option value="">Select a module</option>
            {modules.map(module => (
              <option key={module.moduleId} value={module.moduleId}>
                {module.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {assignmentData.moduleId && lessons.length > 0 && (
        <div>
          <label htmlFor="lessonId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson (Optional)
          </label>
          <select
            name="lessonId"
            id="lessonId"
            value={assignmentData.lessonId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
          >
            <option value="">Select a lesson</option>
            {lessons
              .filter(lesson => lesson.moduleId === assignmentData.moduleId)
              .map(lesson => (
                <option key={lesson.lessonId} value={lesson.lessonId}>
                  {lesson.title}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}