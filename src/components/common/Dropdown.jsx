import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Dropdown({ 
  trigger, 
  items, 
  align = 'right', 
  className = '',
  triggerClassName = '',
  menuClassName = '',
  position = 'bottom'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 192; 
    const dropdownHeight = items.length * 36 + 16; 

    let newPosition = {};

    // Horizontal alignment
    if (align === 'right') {
      const spaceRight = viewportWidth - triggerRect.right;
      newPosition.left = spaceRight >= dropdownWidth ? 0 : 'auto';
      newPosition.right = spaceRight >= dropdownWidth ? 'auto' : 0;
    } else {
      const spaceLeft = triggerRect.left;
      newPosition.left = spaceLeft >= dropdownWidth ? 'auto' : 0;
      newPosition.right = spaceLeft >= dropdownWidth ? 0 : 'auto';
    }

    // Vertical position
    if (position === 'bottom') {
      const spaceBelow = viewportHeight - triggerRect.bottom;
      newPosition.top = spaceBelow >= dropdownHeight ? '100%' : 'auto';
      newPosition.bottom = spaceBelow >= dropdownHeight ? 'auto' : '100%';
    } else {
      const spaceAbove = triggerRect.top;
      newPosition.top = spaceAbove >= dropdownHeight ? 'auto' : '100%';
      newPosition.bottom = spaceAbove >= dropdownHeight ? '100%' : 'auto';
    }

    setDropdownPosition(newPosition);
  };

  // Fecha o dropdown e recalcula posição
  const closeDropdown = () => setIsOpen(false);

  // Event listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    const handleResize = () => {
      if (isOpen) calculatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Recalcula posição quando abre
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen]);

  return (
    <div 
      className={`relative inline-block ${className}`} 
      ref={dropdownRef}
    >
      <div 
        ref={triggerRef}
        onClick={() => {
          setIsOpen(!isOpen);
          calculatePosition();
        }}
        className={`cursor-pointer ${triggerClassName}`}
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`
            absolute z-50 mt-1 w-48 rounded-lg shadow-xl
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            overflow-hidden transition-all duration-200 origin-top
            ${menuClassName}
          `}
          style={{
            left: dropdownPosition.left,
            right: dropdownPosition.right,
            top: dropdownPosition.top,
            bottom: dropdownPosition.bottom,
            transform: isOpen ? 'scale(1)' : 'scale(0.95)',
            opacity: isOpen ? 1 : 0,
            minWidth: '12rem'
          }}
          role="menu"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                  closeDropdown();
                }}
                className={`
                  block w-full text-left px-4 py-2 text-sm
                  transition-colors duration-150
                  ${item.danger 
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                  flex items-center
                `}
                role="menuitem"
              >
                {item.icon && (
                  <span className="mr-2.5">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      action: PropTypes.func.isRequired,
      danger: PropTypes.bool
    })
  ).isRequired,
  align: PropTypes.oneOf(['right', 'left']),
  position: PropTypes.oneOf(['bottom', 'top']),
  className: PropTypes.string,
  triggerClassName: PropTypes.string,
  menuClassName: PropTypes.string
};

Dropdown.defaultProps = {
  align: 'right',
  position: 'bottom',
  className: '',
  triggerClassName: '',
  menuClassName: ''
};