export default function EventDetails({ event }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            About This Event
          </h2>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
  
          {event.agenda && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Event Agenda
              </h3>
              <ul className="space-y-3">
                {event.agenda.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{item.time}</p>
                      <p className="text-gray-600 dark:text-gray-400">{item.activity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }