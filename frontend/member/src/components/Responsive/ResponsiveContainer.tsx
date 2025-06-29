import React, { ReactNode } from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  fullWidth = false,
  padding = 'medium'
}) => {
  const { deviceType, isMobile, isTablet } = useResponsive();

  // Mobile-first container styles
  const getContainerStyles = () => {
    const baseStyles = 'w-full mx-auto';
    
    if (fullWidth) {
      return `${baseStyles} max-w-none`;
    }

    // Mobile-first progressive enhancement
    switch (deviceType) {
      case 'mobile':
        return `${baseStyles} max-w-full`;
      case 'tablet':
        return `${baseStyles} max-w-3xl`;
      case 'desktop':
        return `${baseStyles} max-w-6xl`;
      case 'large':
        return `${baseStyles} max-w-7xl`;
      default:
        return `${baseStyles} max-w-full`;
    }
  };

  // Mobile-first padding
  const getPaddingStyles = () => {
    if (padding === 'none') return '';

    const paddingMap = {
      small: {
        mobile: 'px-4 py-2',
        tablet: 'px-6 py-4', 
        desktop: 'px-8 py-6',
        large: 'px-10 py-8'
      },
      medium: {
        mobile: 'px-4 py-4',
        tablet: 'px-6 py-6',
        desktop: 'px-8 py-8', 
        large: 'px-10 py-10'
      },
      large: {
        mobile: 'px-6 py-6',
        tablet: 'px-8 py-8',
        desktop: 'px-10 py-10',
        large: 'px-12 py-12'
      }
    };

    return paddingMap[padding][deviceType];
  };

  const containerClasses = [
    getContainerStyles(),
    getPaddingStyles(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
