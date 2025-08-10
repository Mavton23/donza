export default function LessonFormPublishing({ lessonData, setLessonData }) {
    const handleChange = (e) => {
      const { name, checked } = e.target;
      setLessonData(prev => ({
        ...prev,
        [name]: checked
      }));
    };
  
    return (
      <div className="space-y-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isFree"
              name="isFree"
              type="checkbox"
              checked={lessonData.isFree}
              onChange={handleChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isFree" className="font-medium text-gray-700 dark:text-gray-300">
              Free Lesson
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Check this if you want to make this lesson available for free.
            </p>
          </div>
        </div>
  
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={lessonData.isPublished}
              onChange={handleChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isPublished" className="font-medium text-gray-700 dark:text-gray-300">
              Publish Immediately
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Check this if you want to make this lesson available to students right away.
            </p>
          </div>
        </div>
      </div>
    );
  }