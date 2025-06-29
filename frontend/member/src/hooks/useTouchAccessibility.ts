import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TOUCH_TARGETS,
  ACCESSIBILITY_LEVELS,
  TOUCH_GESTURES,
  DEVICE_TOUCH_CONFIG,
  COLOR_CONTRAST,
  FOCUS_MANAGEMENT,
  SCREEN_READER,
  TOUCH_FEEDBACK,
  TouchTargetPlatform,
  AccessibilityLevel,
  DeviceTouchType
} from './touch-accessibility';

interface TouchAccessibilityState {
  // Touch capabilities
  isTouchDevice: boolean;
  touchTargetSize: number;
  touchSpacing: number;
  supportedGestures: string[];
  
  // Accessibility settings
  accessibilityLevel: AccessibilityLevel;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderActive: boolean;
  keyboardNavigation: boolean;
  
  // Device optimization
  deviceTouchType: DeviceTouchType;
  hapticSupport: boolean;
  audioFeedback: boolean;
  
  // Focus management
  focusVisible: boolean;
  focusWithin: boolean;
  trapFocus: boolean;
}

export function useTouchAccessibility(
  platform: TouchTargetPlatform = 'universal',
  accessibilityLevel: AccessibilityLevel = 'levelAA'
): TouchAccessibilityState {
  const [state, setState] = useState<TouchAccessibilityState>(() => {
    if (typeof window === 'undefined') {
      return {
        isTouchDevice: false,
        touchTargetSize: TOUCH_TARGETS.universal.recommended,
        touchSpacing: TOUCH_TARGETS.universal.spacing,
        supportedGestures: ['tap'],
        accessibilityLevel,
        reducedMotion: false,
        highContrast: false,
        screenReaderActive: false,
        keyboardNavigation: true,
        deviceTouchType: 'desktop',
        hapticSupport: false,
        audioFeedback: false,
        focusVisible: false,
        focusWithin: false,
        trapFocus: false
      };
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const deviceType = window.innerWidth <= 767 ? 'mobile' : 
                      window.innerWidth <= 1024 ? 'tablet' : 
                      isTouchDevice ? 'hybrid' : 'desktop';
    
    const touchConfig = DEVICE_TOUCH_CONFIG[deviceType];
    const targetConfig = TOUCH_TARGETS[platform];
    
    return {
      isTouchDevice,
      touchTargetSize: targetConfig.recommended,
      touchSpacing: targetConfig.spacing,
      supportedGestures: touchConfig.gestures,
      accessibilityLevel,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      screenReaderActive: false, // Will be detected dynamically
      keyboardNavigation: true,
      deviceTouchType: deviceType,
      hapticSupport: 'vibrate' in navigator,
      audioFeedback: 'AudioContext' in window || 'webkitAudioContext' in window,
      focusVisible: false,
      focusWithin: false,
      trapFocus: false
    };
  });

  // Detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      // Multiple methods to detect screen reader
      const hasAriaLive = document.querySelectorAll('[aria-live]').length > 0;
      const hasScreenReaderText = document.querySelectorAll('.sr-only').length > 0;
      const hasAccessibilityAPI = 'speechSynthesis' in window;
      
      // Check for common screen reader indicators
      const userAgent = navigator.userAgent.toLowerCase();
      const hasScreenReaderUA = userAgent.includes('nvda') || 
                               userAgent.includes('jaws') || 
                               userAgent.includes('dragon');
      
      const screenReaderActive = hasAriaLive || hasScreenReaderText || 
                               hasAccessibilityAPI || hasScreenReaderUA;
      
      setState(prev => ({ ...prev, screenReaderActive }));
    };

    detectScreenReader();
    
    // Listen for accessibility API usage
    const handleSpeechStart = () => {
      setState(prev => ({ ...prev, screenReaderActive: true }));
    };
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleSpeechStart);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleSpeechStart);
      };
    }
  }, []);

  // Update preferences when media queries change
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, highContrast: e.matches }));
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  return state;
}

// Hook for touch gesture handling
export function useTouchGestures(element: React.RefObject<HTMLElement>) {
  const [gesture, setGesture] = useState<{
    type: string | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startTime: number;
    duration: number;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    duration: 0
  });

  const gestureRef = useRef(gesture);
  gestureRef.current = gesture;

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      
      setGesture({
        type: null,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        duration: 0
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      
      setGesture(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        duration: now - prev.startTime
      }));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      const finalGesture = gestureRef.current;
      const deltaX = finalGesture.currentX - finalGesture.startX;
      const deltaY = finalGesture.currentY - finalGesture.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = now - finalGesture.startTime;
      
      let gestureType = 'tap';
      
      if (duration > TOUCH_GESTURES.longPress.minDuration && 
          distance < TOUCH_GESTURES.longPress.maxMovement) {
        gestureType = 'longPress';
      } else if (distance > TOUCH_GESTURES.swipe.minDistance && 
                duration < TOUCH_GESTURES.swipe.maxDuration) {
        gestureType = 'swipe';
      } else if (duration < TOUCH_GESTURES.tap.maxDuration && 
                distance < TOUCH_GESTURES.tap.maxMovement) {
        gestureType = 'tap';
      }
      
      setGesture(prev => ({ ...prev, type: gestureType, duration }));
      
      // Reset after gesture recognition
      setTimeout(() => {
        setGesture(prev => ({ ...prev, type: null }));
      }, 100);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element]);

  return gesture;
}

// Hook for focus management
export function useFocusManagement() {
  const [focusState, setFocusState] = useState({
    focusVisible: false,
    focusWithin: false,
    lastFocusedElement: null as HTMLElement | null
  });

  const trapFocusInContainer = useCallback((container: HTMLElement) => {
    const cleanup = FOCUS_MANAGEMENT.trapFocus(container);
    setFocusState(prev => ({ ...prev, lastFocusedElement: document.activeElement as HTMLElement }));
    return cleanup;
  }, []);

  const restoreFocus = useCallback(() => {
    FOCUS_MANAGEMENT.restoreFocus(focusState.lastFocusedElement);
    setFocusState(prev => ({ ...prev, lastFocusedElement: null }));
  }, [focusState.lastFocusedElement]);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    SCREEN_READER.announce(message, priority);
  }, []);

  useEffect(() => {
    const handleFocusIn = () => {
      setFocusState(prev => ({ ...prev, focusVisible: true }));
    };

    const handleFocusOut = () => {
      setFocusState(prev => ({ ...prev, focusVisible: false }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusState(prev => ({ ...prev, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setFocusState(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return {
    ...focusState,
    trapFocusInContainer,
    restoreFocus,
    announceToScreenReader
  };
}

// Hook for accessible color management
export function useAccessibleColors() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateColorScheme = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    const updateHighContrast = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    setColorScheme(darkModeQuery.matches ? 'dark' : 'light');
    setHighContrast(highContrastQuery.matches);

    darkModeQuery.addEventListener('change', updateColorScheme);
    highContrastQuery.addEventListener('change', updateHighContrast);

    return () => {
      darkModeQuery.removeEventListener('change', updateColorScheme);
      highContrastQuery.removeEventListener('change', updateHighContrast);
    };
  }, []);

  const getAccessibleColorPair = useCallback((level: AccessibilityLevel = 'levelAA') => {
    const pairs = highContrast 
      ? COLOR_CONTRAST.accessiblePairs.highContrast
      : COLOR_CONTRAST.accessiblePairs.standardContrast;
    
    return colorScheme === 'dark' 
      ? pairs.find(pair => pair.background[0] === 0) || pairs[1]
      : pairs.find(pair => pair.background[0] === 255) || pairs[0];
  }, [colorScheme, highContrast]);

  const checkContrastRatio = useCallback((
    foreground: [number, number, number], 
    background: [number, number, number],
    level: AccessibilityLevel = 'levelAA'
  ) => {
    const ratio = COLOR_CONTRAST.getContrastRatio(foreground, background);
    const meetsStandard = COLOR_CONTRAST.meetsStandard(ratio, level.replace('level', '') as 'A' | 'AA' | 'AAA');
    
    return { ratio, meetsStandard };
  }, []);

  return {
    colorScheme,
    highContrast,
    getAccessibleColorPair,
    checkContrastRatio
  };
}

// Hook for touch feedback
export function useTouchFeedback() {
  const touchState = useTouchAccessibility();

  const provideFeedback = useCallback((
    element: HTMLElement, 
    event: TouchEvent | MouseEvent,
    options: {
      visual?: boolean;
      haptic?: boolean;
      audio?: boolean;
      vibrationPattern?: number | number[];
    } = {}
  ) => {
    const {
      visual = true,
      haptic = touchState.hapticSupport,
      audio = false,
      vibrationPattern = 50
    } = options;

    if (visual) {
      TOUCH_FEEDBACK.createRippleEffect(element, event);
    }

    if (haptic && touchState.hapticSupport) {
      TOUCH_FEEDBACK.vibrate(vibrationPattern);
    }

    if (audio && touchState.audioFeedback) {
      TOUCH_FEEDBACK.playTouchSound();
    }
  }, [touchState.hapticSupport, touchState.audioFeedback]);

  return { provideFeedback };
}
