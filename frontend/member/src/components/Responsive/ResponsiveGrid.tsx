import React, { ReactNode } from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: 'small' | 'medium' | 'large';
  minItemWidth?: number; // px
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'medium',
  minItemWidth
}) => {
  const { deviceType, width } = useResponsive();

  // Get appropriate column count for current device
  const getColumnCount = () => {
    if (minItemWidth && width) {
      // Auto-fit based on minimum item width
      const maxCols = Math.floor(width / minItemWidth);
      return Math.max(1, maxCols);
    }

    return cols[deviceType] || cols.mobile || 1;
  };

  // Mobile-first gap styles
  const getGapStyles = () => {
    const gapMap = {
      small: {
        mobile: 'gap-2',
        tablet: 'gap-3',
        desktop: 'gap-4',
        large: 'gap-4'
      },
      medium: {
        mobile: 'gap-4',
        tablet: 'gap-6',
        desktop: 'gap-8',
        large: 'gap-8'
      },
      large: {
        mobile: 'gap-6',
        tablet: 'gap-8',
        desktop: 'gap-10',
        large: 'gap-12'
      }
    };

    return gapMap[gap][deviceType];
  };

  const columnCount = getColumnCount();
  const gridClasses = [
    'grid',
    `grid-cols-${columnCount}`,
    getGapStyles(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
