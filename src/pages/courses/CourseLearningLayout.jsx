import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CourseLearningHeader from '@/components/courses/CourseLearningHeader';
import SidebarOverlay from '@/components/courses/SidebarOverlay';
import { useHotkeys } from 'react-hotkeys-hook';
import { useCourseContext } from '@/contexts/CourseContext';
import { ChevronRightIcon } from 'lucide-react';

export default function CourseLearningLayout({ course, progress, sidebar, mainContent }) {
  const { sidebarState, setSidebarState } = useCourseContext();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isResizing, setIsResizing] = useState(false);

  // Hotkey para alternar sidebar (Ctrl/Cmd + B)
  useHotkeys('meta+b, ctrl+b', () => {
    setSidebarState(prev => ({ ...prev, open: !prev.open }));
  });

  // Ajusta o estado inicial da sidebar baseado no viewport
  useEffect(() => {
    setSidebarState({
      open: isDesktop,
      collapsed: false,
      width: isDesktop ? 320 : 280
    });
  }, [isDesktop, setSidebarState]);

  // Efeito para desabilitar scroll quando sidebar mobile está aberta
  useEffect(() => {
    if (!isDesktop && sidebarState.open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isDesktop, sidebarState.open]);

  const handleSidebarDragStart = (e) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = (e) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, 240), 480);
    setSidebarState(prev => ({ ...prev, width: newWidth }));
  };

  const handleDragEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 relative">
      <CourseLearningHeader 
        course={course}
        progress={progress}
        onToggleSidebar={() => setSidebarState(prev => ({ ...prev, open: !prev.open }))}
        isSidebarOpen={sidebarState.open}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar com redimensionamento */}
        <aside 
          className={`h-full bg-white dark:bg-gray-800 flex flex-col transition-all duration-200 ease-in-out
            ${sidebarState.open ? 'block' : 'hidden lg:block lg:w-20'}
            ${isResizing ? 'select-none' : ''}
          `}
          style={{ width: sidebarState.open ? `${sidebarState.width}px` : undefined }}
        >
          <div className="flex-1 overflow-y-auto">
            {sidebarState.open ? sidebar : (
              <CollapsedSidebarView 
                course={course} 
                onExpand={() => setSidebarState(prev => ({ ...prev, open: true }))}
              />
            )}
          </div>
          
          {sidebarState.open && isDesktop && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onMouseDown={handleSidebarDragStart}
            />
          )}
        </aside>

        {/* Overlay para mobile */}
        {!isDesktop && sidebarState.open && (
          <SidebarOverlay 
            onClick={() => setSidebarState(prev => ({ ...prev, open: false }))}
          />
        )}

        {/* Conteúdo principal */}
        <main 
          className={`flex-1 overflow-y-auto transition-all duration-200 ${
            sidebarState.open && isDesktop ? 'ml-0' : 'lg:ml-20'
          }`}
        >
          {mainContent}
        </main>
      </div>
    </div>
  );
}

function CollapsedSidebarView({ course, onExpand }) {
  return (
    <div className="flex flex-col items-center py-4 h-full">
      <button 
        onClick={onExpand}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mb-4"
        aria-label="Expand sidebar"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
      <div className="flex-1 flex flex-col items-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span className="text-xs font-medium">
            {Math.floor(course.progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}