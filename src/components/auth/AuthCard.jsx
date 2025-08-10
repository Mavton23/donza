export default function AuthCard({ children }) {
    return (
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-8 border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    );
  }