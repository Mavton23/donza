export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const leftOffset = Math.floor(maxVisiblePages / 2);
        let start = currentPage - leftOffset;
        let end = currentPage + leftOffset;
  
        if (start < 1) {
          start = 1;
          end = maxVisiblePages;
        } else if (end > totalPages) {
          end = totalPages;
          start = totalPages - maxVisiblePages + 1;
        }
  
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');
  
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
  
        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);
      }
  
      return pages;
    };
  
    return (
      <nav className="flex items-center justify-center">
        <ul className="flex items-center space-x-1">
          <li>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
          </li>
  
          {getPageNumbers().map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="px-3 py-1">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
  
          <li>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  }