export default function ReviewFilters({ filters, onChange, showAdvanced }) {
  const handleChange = (name, value) => {
    onChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <div>
        <label htmlFor="sort" className="sr-only">Sort</label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="rounded-md p-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div>
        <label htmlFor="rating" className="sr-only">Rating</label>
        <select
          id="rating"
          value={filters.rating}
          onChange={(e) => handleChange('rating', e.target.value)}
          className="rounded-md p-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="hasComment"
          type="checkbox"
          checked={filters.hasComment}
          onChange={(e) => handleChange('hasComment', e.target.checked)}
          className="h-4 w-4 p-2 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="hasComment" className="ml-2 text-sm">
          With Comments Only
        </label>
      </div>

      {showAdvanced && (
        <div>
          <label htmlFor="status" className="sr-only">Status</label>
          <select
            id="status"
            className="rounded-md p-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="responded">Responded</option>
            <option value="pending">Pending Response</option>
          </select>
        </div>
      )}
    </div>
  );
}