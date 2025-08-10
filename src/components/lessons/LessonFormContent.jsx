export default function LessonFormContent({ lessonData, setLessonData }) {
    const handleChange = (e) => {
      const { name, value } = e.target;
      setLessonData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    return (
      <div className="space-y-6">
        {lessonData.lessonType === 'video' && (
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video URL *
            </label>
            <input
              type="url"
              name="videoUrl"
              id="videoUrl"
              value={lessonData.videoUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
              required={lessonData.lessonType === 'video'}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}
  
        {lessonData.lessonType === 'video' && (
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              min="0"
              value={lessonData.duration}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
              required={lessonData.lessonType === 'video'}
            />
          </div>
        )}
  
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {lessonData.lessonType === 'video' ? 'Description' : 'Content'} *
          </label>
          <textarea
            name="content"
            id="content"
            rows={8}
            value={lessonData.content}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white"
            required
          />
        </div>
      </div>
    );
  }