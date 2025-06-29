// Responsive Design Configuration
// Task 4.6.1 - Breakpoints and responsive utilities

export const BREAKPOINTS = {
  mobile: {
    min: 320,
    max: 767
  },
  tablet: {
    min: 768,
    max: 1023
  },
  desktop: {
    min: 1024,
    max: 1439
  },
  large: {
    min: 1440,
    max: 9999
  }
} as const;

export const BREAKPOINT_VALUES = {
  xs: 320,  // Extra small (mobile)
  sm: 640,  // Small (mobile landscape)
  md: 768,  // Medium (tablet)
  lg: 1024, // Large (desktop)
  xl: 1280, // Extra large
  xxl: 1440 // XXL screens
} as const;

export type BreakpointKey = keyof typeof BREAKPOINT_VALUES;
export type DeviceType = keyof typeof BREAKPOINTS;

// Tailwind-like responsive utility classes
export const RESPONSIVE_CLASSES = {
  // Container sizes
  container: {
    mobile: 'max-w-full px-4',
    tablet: 'max-w-3xl px-6 mx-auto',
    desktop: 'max-w-6xl px-8 mx-auto',
    large: 'max-w-7xl px-8 mx-auto'
  },
  
  // Grid systems
  grid: {
    mobile: 'grid grid-cols-1 gap-4',
    tablet: 'grid grid-cols-2 gap-6',
    desktop: 'grid grid-cols-3 gap-8',
    large: 'grid grid-cols-4 gap-8'
  },
  
  // Spacing
  padding: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8',
    large: 'p-10'
  },
  
  // Text sizes
  text: {
    mobile: 'text-sm',
    tablet: 'text-base',
    desktop: 'text-lg',
    large: 'text-xl'
  }
} as const;

// Touch target sizes (minimum 44px as per accessibility guidelines)
export const TOUCH_TARGETS = {
  minimum: 44, // px
  comfortable: 48, // px
  large: 56 // px
} as const;

// Media query helpers
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop.min}px) and (max-width: ${BREAKPOINTS.desktop.max}px)`,
  large: `(min-width: ${BREAKPOINTS.large.min}px)`,
  
  // Common queries
  mobileUp: `(min-width: ${BREAKPOINTS.mobile.min}px)`,
  tabletUp: `(min-width: ${BREAKPOINTS.tablet.min}px)`,
  desktopUp: `(min-width: ${BREAKPOINTS.desktop.min}px)`,
  
  mobileDown: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tabletDown: `(max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktopDown: `(max-width: ${BREAKPOINTS.desktop.max}px)`
} as const;

// Device detection utilities
export const getDeviceType = (width: number): DeviceType => {
  if (width <= BREAKPOINTS.mobile.max) return 'mobile';
  if (width <= BREAKPOINTS.tablet.max) return 'tablet';
  if (width <= BREAKPOINTS.desktop.max) return 'desktop';
  return 'large';
};

export const isMobile = (width: number): boolean => 
  width <= BREAKPOINTS.mobile.max;

export const isTablet = (width: number): boolean => 
  width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max;

export const isDesktop = (width: number): boolean => 
  width >= BREAKPOINTS.desktop.min;

export const isTouchDevice = (): boolean => 
  'ontouchstart' in window || navigator.maxTouchPoints > 0;
