import { useEffect } from 'react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useCourseContext } from '@/contexts/CourseContext';
import { Transition } from '@headlessui/react';
import { X } from 'lucide-react';

export default function SidebarOverlay() {
  const { sidebarState, setSidebarState } = useCourseContext();
  useLockBodyScroll(sidebarState.open);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarState(prev => ({ ...prev, open: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setSidebarState]);

  return (
    <Transition
      show={sidebarState.open}
      enter="transition-opacity duration-300 ease-in-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200 ease-in-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div 
        className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
        onClick={() => setSidebarState(prev => ({ ...prev, open: false }))}
        aria-hidden="true"
      >
        {/* Botão de fechar visível apenas em mobile */}
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarState(prev => ({ ...prev, open: false }));
          }}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </Transition>
  );
}