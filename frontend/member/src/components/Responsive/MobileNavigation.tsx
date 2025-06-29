import React, { useState, useRef, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  onItemClick,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile, isTouchDevice } = useResponsive();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle item selection
  const handleItemClick = (item: NavigationItem) => {
    setIsOpen(false);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <div className={`relative ${className}`} ref={menuRef}>
        {/* Hamburger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex flex-col justify-center items-center w-12 h-12 
            bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isTouchDevice ? 'min-h-[44px] min-w-[44px]' : ''}
          `}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 mt-1 transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 mt-1 transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>

        {/* Mobile menu overlay */}
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
              <div className="py-2">
                {items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full px-4 py-3 text-left flex items-center space-x-3
                      hover:bg-gray-50 transition-colors
                      ${item.active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' : 'text-gray-700'}
                      ${isTouchDevice ? 'min-h-[44px]' : ''}
                    `}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 w-5 h-5">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop horizontal navigation
  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item)}
          className={`
            px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
            ${item.active 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {item.icon && (
            <span className="w-4 h-4">
              {item.icon}
            </span>
          )}
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNavigation;
