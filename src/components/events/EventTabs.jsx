export default function EventTabs({ activeTab, setActiveTab, isOrganizer }) {
  const tabs = [
    { id: 'details', name: 'Detalhes' },
    { id: 'organizer', name: 'Organizador' },
    ...(isOrganizer ? [{ id: 'participants', name: 'Participantes' }] : []),
    ...(isOrganizer ? [{ id: 'management', name: 'Gerenciamento' }] : []),
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}