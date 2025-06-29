import { useState, useEffect, useCallback } from 'react';
import { getDeviceType, isMobile, isTablet, isDesktop, isTouchDevice, DeviceType } from './responsive-config';

interface ResponsiveState {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Safe default values for SSR
    const defaultWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const defaultHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      width: defaultWidth,
      height: defaultHeight,
      deviceType: getDeviceType(defaultWidth),
      isMobile: isMobile(defaultWidth),
      isTablet: isTablet(defaultWidth),
      isDesktop: isDesktop(defaultWidth),
      isLarge: defaultWidth >= 1440,
      isTouchDevice: typeof window !== 'undefined' ? isTouchDevice() : false,
      orientation: defaultWidth > defaultHeight ? 'landscape' : 'portrait'
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    
    setState({
      width,
      height,
      deviceType,
      isMobile: isMobile(width),
      isTablet: isTablet(width),
      isDesktop: isDesktop(width),
      isLarge: width >= 1440,
      isTouchDevice: isTouchDevice(),
      orientation: width > height ? 'landscape' : 'portrait'
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update on mount
    updateState();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 150);
    };

    // Orientation change handler
    const handleOrientationChange = () => {
      // Delay to ensure accurate dimensions after orientation change
      setTimeout(updateState, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, [updateState]);

  return state;
}

// Hook for specific breakpoint matching
export function useBreakpoint(breakpoint: DeviceType): boolean {
  const { deviceType } = useResponsive();
  return deviceType === breakpoint;
}

// Hook for minimum breakpoint matching (mobile-first approach)
export function useBreakpointUp(breakpoint: DeviceType): boolean {
  const { width } = useResponsive();
  
  switch (breakpoint) {
    case 'mobile':
      return width >= 320;
    case 'tablet':
      return width >= 768;
    case 'desktop':
      return width >= 1024;
    case 'large':
      return width >= 1440;
    default:
      return false;
  }
}

// Hook for maximum breakpoint matching
export function useBreakpointDown(breakpoint: DeviceType): boolean {
  const { width } = useResponsive();
  
  switch (breakpoint) {
    case 'mobile':
      return width <= 767;
    case 'tablet':
      return width <= 1023;
    case 'desktop':
      return width <= 1439;
    case 'large':
      return true; // Always true for large screens
    default:
      return false;
  }
}

// Hook for media query matching
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
