import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CheckIcon, PlayIcon, CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseContentBrowser({ 
  course, 
  selectedId, 
  progressData, 
  onSelect 
}) {
  const [expandedModules, setExpandedModules] = useState({});

  // Hotkey para navegação (Alt+ArrowDown/ArrowUp)
  useHotkeys('alt+down', () => navigateLesson(1));
  useHotkeys('alt+up', () => navigateLesson(-1));

  const getAllLessons = () => {
    return course?.modules?.flatMap(module => 
      module.lessons?.map(lesson => ({
        ...lesson,
        moduleTitle: module.title,
        moduleId: module.moduleId
      })) || []
    ) || [];
  };

  const navigateLesson = (direction) => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.lessonId === selectedId);
    
    if (currentIndex === -1) return;
    
    const newIndex = Math.max(0, Math.min(allLessons.length - 1, currentIndex + direction));
    onSelect(allLessons[newIndex]);
  };

  // Inicializa módulos expandidos
  useEffect(() => {
    if (course?.modules) {
      const initialExpanded = {};
      course.modules.forEach(module => {
        initialExpanded[module.moduleId] = true;
      });
      setExpandedModules(initialExpanded);
    }
  }, [course]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Verifica se uma lição está concluída
  const isLessonCompleted = (lessonId) => {
    return progressData?.completedLessons?.includes?.(lessonId) || false;
  };

  if (!course?.modules) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Nenhum conteúdo disponível
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold flex items-center justify-between">
          <span>Conteúdo do Curso</span>
          {progressData && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {progressData.completedLessons || 0}/{progressData.totalLessons || 0} concluídas
            </span>
          )}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence initial={false}>
          {course.modules.map((module) => (
            <div key={module.moduleId} className="mb-1">
              <div 
                onClick={() => toggleModule(module.moduleId)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md cursor-pointer",
                  "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  "transition-colors duration-150 px-3 py-2"
                )}
              >
                <span className="font-medium truncate flex-1">
                  {module.title}
                </span>
                
                <motion.div
                  animate={{ rotate: expandedModules[module.moduleId] ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {expandedModules[module.moduleId] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700"
                  >
                    {module.lessons?.map(lesson => (
                      <LessonItem
                        key={lesson.lessonId}
                        lesson={lesson}
                        isSelected={lesson.lessonId === selectedId}
                        onClick={() => onSelect({
                          ...lesson,
                          moduleTitle: module.title,
                          moduleId: module.moduleId
                        })}
                        isCompleted={isLessonCompleted(lesson.lessonId)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const LessonItem = ({ lesson, isSelected, onClick, isCompleted }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-2 rounded-md cursor-pointer flex items-center px-3 py-2",
        "transition-colors duration-150",
        isSelected
          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/30"
      )}
    >
      <span className="mr-2">
        {isSelected ? (
          <PlayIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        ) : isCompleted ? (
          <CheckIcon className="h-3 w-3 text-green-500" />
        ) : (
          <CircleIcon className="h-2 w-2 text-gray-400 dark:text-gray-500" />
        )}
      </span>
      <span className="truncate flex-1">{lesson.title}</span>
      {isCompleted && !isSelected && (
        <CheckIcon className="ml-2 h-4 w-4 text-green-500 flex-shrink-0" />
      )}
    </motion.div>
  );
};