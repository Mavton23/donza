export default function InstructorReviewTools({ courseId }) {
    const handleExport = async () => {
      // TO DO: exportação de reviews
    };
  
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleExport}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Export Reviews
        </button>
      </div>
    );
  }