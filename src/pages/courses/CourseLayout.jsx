import { useState } from 'react';
import CourseLearningHeader from '../../components/courses/CourseLearningHeader';

export default function CourseLayout({ course, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <CourseLearningHeader 
        course={course}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-gray-200 dark:border-gray-700`}>
          {children}
        </aside>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}