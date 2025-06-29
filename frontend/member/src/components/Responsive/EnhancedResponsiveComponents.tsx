import React from 'react';
import { 
  useEnhancedResponsive, 
  useEnhancedBreakpoint, 
  useResponsiveValue,
  usePerformanceAwareResponsive
} from '../src/hooks/useEnhancedResponsive';

// Enhanced Responsive Card with precise breakpoint control
export const EnhancedCard: React.FC<{
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'featured' | 'compact';
}> = ({ title, children, variant = 'default' }) => {
  const { deviceType, spacing, typography } = useEnhancedResponsive();
  
  const cardPadding = useResponsiveValue({
    mobile: spacing.md,
    tablet: spacing.lg,
    desktop: spacing.xl,
    large: spacing.xl
  });
  
  const titleSize = useResponsiveValue({
    mobile: typography.lg,
    tablet: typography.xl,
    desktop: typography['2xl'],
    large: typography['3xl']
  });
  
  const cardClass = `
    bg-white rounded-lg shadow-md border border-gray-200 
    ${variant === 'featured' ? 'ring-2 ring-blue-500' : ''}
    ${variant === 'compact' ? 'shadow-sm' : ''}
  `;
  
  return (
    <div className={cardClass} style={{ padding: cardPadding }}>
      <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: titleSize }}>
        {title}
      </h3>
      {children}
    </div>
  );
};

// Enhanced Responsive Button with touch optimization
export const EnhancedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, onClick, variant = 'primary', size = 'md' }) => {
  const { isTouchDevice, spacing } = useEnhancedResponsive();
  const performanceState = usePerformanceAwareResponsive();
  
  const buttonHeight = isTouchDevice ? '44px' : 'auto';
  const buttonPadding = useResponsiveValue({
    mobile: `${spacing.sm} ${spacing.md}`,
    tablet: `${spacing.md} ${spacing.lg}`,
    desktop: `${spacing.md} ${spacing.xl}`,
    large: `${spacing.lg} ${spacing.xl}`
  });
  
  const baseClass = `
    font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
    ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
    ${performanceState.shouldReduceMotion ? '' : 'transform hover:scale-105'}
  `;
  
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  }[variant];
  
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass}`}
      style={{ 
        minHeight: buttonHeight,
        padding: buttonPadding
      }}
    >
      {children}
    </button>
  );
};

// Enhanced Responsive Grid with precise column control
export const EnhancedResponsiveGrid: React.FC<{
  children: React.ReactNode;
  minItemWidth?: number;
  maxColumns?: number;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, minItemWidth = 250, maxColumns = 4, gap = 'md' }) => {
  const { width, spacing, grid } = useEnhancedResponsive();
  
  // Calculate optimal columns based on screen width and minimum item width
  const calculateColumns = () => {
    const availableWidth = width - (parseInt(grid.margin) * 2);
    const possibleColumns = Math.floor(availableWidth / minItemWidth);
    return Math.min(possibleColumns, maxColumns);
  };
  
  const columns = calculateColumns();
  const gapSize = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg
  }[gap];
  
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapSize
      }}
    >
      {children}
    </div>
  );
};

// Enhanced Responsive Image with performance optimization
export const EnhancedImage: React.FC<{
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, aspectRatio = 'landscape', loading = 'lazy' }) => {
  const performanceState = usePerformanceAwareResponsive();
  const { pixelRatio } = useEnhancedResponsive();
  
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }[aspectRatio];
  
  // Optimize image based on connection and device
  const optimizedSrc = performanceState.shouldOptimizeImages 
    ? `${src}?w=800&q=75` 
    : `${src}?w=1200&q=90`;
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${aspectRatioClass}`}>
      <img
        src={optimizedSrc}
        alt={alt}
        loading={performanceState.shouldLazyLoad ? 'lazy' : loading}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          imageRendering: pixelRatio < 2 ? 'auto' : 'crisp-edges'
        }}
      />
    </div>
  );
};

// Enhanced Responsive Typography with precise scaling
export const EnhancedTypography: React.FC<{
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
}> = ({ variant, children, color = 'primary' }) => {
  const { typography, deviceType } = useEnhancedResponsive();
  
  const getTypographySize = () => {
    const sizeMap = {
      h1: typography['3xl'],
      h2: typography['2xl'],
      h3: typography.xl,
      h4: typography.lg,
      h5: typography.base,
      h6: typography.sm,
      body: typography.base,
      caption: typography.xs
    };
    return sizeMap[variant];
  };
  
  const getTypographyWeight = () => {
    const weightMap = {
      h1: 'font-bold',
      h2: 'font-bold',
      h3: 'font-semibold',
      h4: 'font-semibold',
      h5: 'font-medium',
      h6: 'font-medium',
      body: 'font-normal',
      caption: 'font-normal'
    };
    return weightMap[variant];
  };
  
  const colorClass = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    accent: 'text-blue-600',
    muted: 'text-gray-500'
  }[color];
  
  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';
  
  return (
    <Component
      className={`${getTypographyWeight()} ${colorClass}`}
      style={{ fontSize: getTypographySize() }}
    >
      {children}
    </Component>
  );
};

// Enhanced Responsive Navigation with breakpoint-aware layout
export const EnhancedNavigation: React.FC<{
  items: Array<{ label: string; href: string; active?: boolean }>;
  logo?: React.ReactNode;
}> = ({ items, logo }) => {
  const { isMobile, isTablet, spacing } = useEnhancedResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  if (isMobile) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    item.active 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          <div className="flex space-x-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  item.active 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced Responsive Container with precise breakpoint control
export const EnhancedContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}> = ({ children, maxWidth = 'xl', centered = true }) => {
  const { spacing, deviceType } = useEnhancedResponsive();
  
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }[maxWidth];
  
  const responsivePadding = useResponsiveValue({
    mobile: spacing.md,
    tablet: spacing.lg,
    desktop: spacing.xl,
    large: spacing.xl
  });
  
  return (
    <div 
      className={`${maxWidthClass} ${centered ? 'mx-auto' : ''}`}
      style={{ padding: `0 ${responsivePadding}` }}
    >
      {children}
    </div>
  );
};
