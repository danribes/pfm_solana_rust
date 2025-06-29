import { useState, useEffect, useCallback } from 'react';
import { 
  ENHANCED_BREAKPOINTS, 
  DEVICE_BREAKPOINTS,
  BREAKPOINT_UTILS,
  EnhancedBreakpointCategory,
  RESPONSIVE_SPACING,
  RESPONSIVE_TYPOGRAPHY,
  RESPONSIVE_GRID
} from './enhanced-breakpoints';

interface EnhancedResponsiveState {
  // Basic dimensions
  width: number;
  height: number;
  
  // Device classification
  deviceType: EnhancedBreakpointCategory;
  deviceSubtype: string;
  deviceLabel: string;
  optimalDevice: string;
  
  // Boolean helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isTouchDevice: boolean;
  
  // Orientation and display
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  colorScheme: 'light' | 'dark';
  
  // Performance metrics
  connectionType: string;
  memoryInfo?: any;
  
  // Responsive utilities
  spacing: typeof RESPONSIVE_SPACING.mobile;
  typography: typeof RESPONSIVE_TYPOGRAPHY.mobile;
  grid: typeof RESPONSIVE_GRID.mobile;
}

export function useEnhancedResponsive(): EnhancedResponsiveState {
  const [state, setState] = useState<EnhancedResponsiveState>(() => {
    if (typeof window === 'undefined') {
      // SSR-safe defaults
      return {
        width: 1024,
        height: 768,
        deviceType: 'desktop' as EnhancedBreakpointCategory,
        deviceSubtype: 'md',
        deviceLabel: 'Desktop Medium',
        optimalDevice: 'MacBook Air',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLarge: false,
        isTouchDevice: false,
        orientation: 'landscape',
        pixelRatio: 1,
        colorScheme: 'light',
        connectionType: 'unknown',
        spacing: RESPONSIVE_SPACING.desktop,
        typography: RESPONSIVE_TYPOGRAPHY.desktop,
        grid: RESPONSIVE_GRID.desktop
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpointInfo = BREAKPOINT_UTILS.getBreakpointCategory(width);
    const optimalDevice = BREAKPOINT_UTILS.getOptimalBreakpoint(width);
    
    return {
      width,
      height,
      deviceType: breakpointInfo.category,
      deviceSubtype: breakpointInfo.subcategory,
      deviceLabel: breakpointInfo.label,
      optimalDevice,
      isMobile: breakpointInfo.category === 'mobile',
      isTablet: breakpointInfo.category === 'tablet',
      isDesktop: breakpointInfo.category === 'desktop',
      isLarge: breakpointInfo.category === 'large',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: width > height ? 'landscape' : 'portrait',
      pixelRatio: window.devicePixelRatio || 1,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      memoryInfo: (performance as any).memory || undefined,
      spacing: RESPONSIVE_SPACING[breakpointInfo.category],
      typography: RESPONSIVE_TYPOGRAPHY[breakpointInfo.category],
      grid: RESPONSIVE_GRID[breakpointInfo.category]
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpointInfo = BREAKPOINT_UTILS.getBreakpointCategory(width);
    const optimalDevice = BREAKPOINT_UTILS.getOptimalBreakpoint(width);
    
    setState(prevState => ({
      ...prevState,
      width,
      height,
      deviceType: breakpointInfo.category,
      deviceSubtype: breakpointInfo.subcategory,
      deviceLabel: breakpointInfo.label,
      optimalDevice,
      isMobile: breakpointInfo.category === 'mobile',
      isTablet: breakpointInfo.category === 'tablet',
      isDesktop: breakpointInfo.category === 'desktop',
      isLarge: breakpointInfo.category === 'large',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: width > height ? 'landscape' : 'portrait',
      pixelRatio: window.devicePixelRatio || 1,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      memoryInfo: (performance as any).memory || undefined,
      spacing: RESPONSIVE_SPACING[breakpointInfo.category],
      typography: RESPONSIVE_TYPOGRAPHY[breakpointInfo.category],
      grid: RESPONSIVE_GRID[breakpointInfo.category]
    }));
  }, []);

  useEffect(() => {
    updateState();

    // Optimized resize handler with RAF
    let rafId: number;
    let timeout: NodeJS.Timeout;
    
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
      
      rafId = requestAnimationFrame(() => {
        timeout = setTimeout(updateState, 100);
      });
    };

    // Color scheme change handler
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = () => {
      setState(prev => ({
        ...prev,
        colorScheme: colorSchemeQuery.matches ? 'dark' : 'light'
      }));
    };

    // Orientation change handler
    const handleOrientationChange = () => {
      // Delay to ensure accurate dimensions
      setTimeout(updateState, 300);
    };

    // Connection change handler
    const handleConnectionChange = () => {
      setState(prev => ({
        ...prev,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      }));
    };

    // Event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange);
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
      
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
  }, [updateState]);

  return state;
}

// Hook for specific breakpoint matching with enhanced precision
export function useEnhancedBreakpoint(
  category: EnhancedBreakpointCategory, 
  subcategory?: string
): boolean {
  const { deviceType, deviceSubtype } = useEnhancedResponsive();
  
  if (subcategory) {
    return deviceType === category && deviceSubtype === subcategory;
  }
  
  return deviceType === category;
}

// Hook for breakpoint ranges
export function useBreakpointRange(minWidth: number, maxWidth?: number): boolean {
  const { width } = useEnhancedResponsive();
  
  if (maxWidth) {
    return width >= minWidth && width <= maxWidth;
  }
  
  return width >= minWidth;
}

// Hook for device-specific targeting
export function useDeviceTarget(deviceName: keyof typeof DEVICE_BREAKPOINTS): boolean {
  const { width } = useEnhancedResponsive();
  const targetWidth = DEVICE_BREAKPOINTS[deviceName];
  
  // Allow 10% tolerance for device targeting
  const tolerance = targetWidth * 0.1;
  return Math.abs(width - targetWidth) <= tolerance;
}

// Hook for responsive values
export function useResponsiveValue<T>(
  values: Partial<Record<EnhancedBreakpointCategory, T>>
): T | undefined {
  const { deviceType } = useEnhancedResponsive();
  return values[deviceType];
}

// Hook for performance-aware responsive behavior
export function usePerformanceAwareResponsive() {
  const state = useEnhancedResponsive();
  
  const shouldReduceMotion = 
    state.connectionType === '2g' || 
    state.connectionType === 'slow-2g' ||
    (state.memoryInfo && state.memoryInfo.usedJSHeapSize > state.memoryInfo.totalJSHeapSize * 0.8);
    
  const shouldOptimizeImages = 
    state.connectionType === '2g' || 
    state.connectionType === 'slow-2g' ||
    state.pixelRatio < 2;
    
  return {
    ...state,
    shouldReduceMotion,
    shouldOptimizeImages,
    shouldLazyLoad: state.isMobile || state.connectionType === '2g'
  };
}
