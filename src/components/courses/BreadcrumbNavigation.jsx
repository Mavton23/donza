export default function BreadcrumbNavigation({ courseTitle, moduleTitle }) {
  return (
    <nav className="text-sm text-gray-500 dark:text-gray-400 truncate">
      {courseTitle && (
        <>
          <span className="hover:text-gray-700 dark:hover:text-gray-300">
            {courseTitle}
          </span>
          {moduleTitle && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-700 dark:text-gray-300">
                {moduleTitle}
              </span>
            </>
          )}
        </>
      )}
    </nav>
  );
}