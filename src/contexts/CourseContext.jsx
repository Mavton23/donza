import { createContext, useState, useContext } from 'react';

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [sidebarState, setSidebarState] = useState({
    open: true,
    collapsed: false,
    width: 320
  });

  return (
    <CourseContext.Provider value={{ sidebarState, setSidebarState }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourseContext = () => useContext(CourseContext);