export default function RecentActivity({ courses, events }) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Latest Courses</h3>
          <ul className="space-y-2">
            {courses.map(course => (
              <li key={course.id} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  course.completed ? 'bg-green-500' : 'bg-indigo-500'
                }`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {course.title} ({course.progress}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recent Events</h3>
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="text-sm text-gray-700 dark:text-gray-300">
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }