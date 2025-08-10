import { Link } from 'react-router-dom';
import Icon from '../common/Icon';

export default function MessagingHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <Link
          to="/messages/new"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Icon name="plus" className="mr-1" />
          New Conversation
        </Link>
      </div>
    </header>
  );
}