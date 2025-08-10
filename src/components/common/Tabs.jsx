import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  const tabRefs = useRef([]);
  const underlineRef = useRef(null);

  useEffect(() => {
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeTabIndex === -1 || !tabRefs.current[activeTabIndex]) return;

    const activeTabElement = tabRefs.current[activeTabIndex];
    const { offsetLeft, clientWidth } = activeTabElement;

    underlineRef.current.style.width = `${clientWidth}px`;
    underlineRef.current.style.transform = `translateX(${offsetLeft}px)`;
  }, [activeTab, tabs]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon;
          const label = tab.label || tab.name;
          const count = tab.count || tab.badge;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={el => (tabRefs.current[index] = el)}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium relative z-10 transition-colors duration-200 flex items-center gap-2
                ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              role="tab"
            >
              {IconComponent && (
                <IconComponent 
                  size={16} 
                  className={isActive ? 'text-current' : 'text-gray-400 dark:text-gray-500'} 
                />
              )}
              <span>{label}</span>
              {(count > 0 || count === 0) && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        ref={underlineRef}
        className="absolute bottom-0 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 dark:bg-gray-700 opacity-50" />
    </div>
  );
}