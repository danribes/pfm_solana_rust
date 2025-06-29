// Touch Optimization & Accessibility System
// Task 4.6.1 Sub-task 3 - Advanced touch interactions and accessibility compliance

export interface TouchTarget {
  minSize: number;
  recommendedSize: number;
  spacing: number;
  hitArea?: number;
}

export interface AccessibilityConfig {
  ariaLabels: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  focusManagement: boolean;
}

// Touch target specifications based on platform guidelines
export const TOUCH_TARGETS = {
  // iOS Human Interface Guidelines
  ios: {
    minimum: 44,      // 44pt minimum
    recommended: 48,  // 48pt recommended
    spacing: 8,       // 8pt minimum spacing
    hitArea: 44      // Minimum hit area
  },
  
  // Android Material Design
  android: {
    minimum: 48,      // 48dp minimum
    recommended: 56,  // 56dp recommended
    spacing: 8,       // 8dp minimum spacing
    hitArea: 48       // Minimum hit area
  },
  
  // Web accessibility (WCAG 2.1 AA)
  web: {
    minimum: 44,      // 44px minimum (Level AA)
    recommended: 48,  // 48px recommended
    spacing: 2,       // 2px minimum spacing
    hitArea: 44       // Minimum hit area
  },
  
  // Universal (most restrictive for cross-platform)
  universal: {
    minimum: 48,      // Largest minimum across platforms
    recommended: 56,  // Largest recommended
    spacing: 8,       // Largest spacing requirement
    hitArea: 48       // Largest hit area
  }
} as const;

// Accessibility compliance levels
export const ACCESSIBILITY_LEVELS = {
  // WCAG 2.1 Level A (minimum)
  levelA: {
    contrast: 3.0,
    textSize: 12,
    touchTarget: 24,
    keyboardNav: true,
    altText: true,
    headingStructure: true
  },
  
  // WCAG 2.1 Level AA (standard)
  levelAA: {
    contrast: 4.5,
    textSize: 14,
    touchTarget: 44,
    keyboardNav: true,
    altText: true,
    headingStructure: true,
    colorIndependence: true,
    focusVisible: true
  },
  
  // WCAG 2.1 Level AAA (enhanced)
  levelAAA: {
    contrast: 7.0,
    textSize: 16,
    touchTarget: 48,
    keyboardNav: true,
    altText: true,
    headingStructure: true,
    colorIndependence: true,
    focusVisible: true,
    contextHelp: true,
    errorPrevention: true
  }
} as const;

// Touch gesture types and configurations
export const TOUCH_GESTURES = {
  tap: {
    maxDuration: 200,     // Maximum tap duration (ms)
    maxMovement: 10,      // Maximum movement during tap (px)
    doubleTapDelay: 300   // Double-tap detection window (ms)
  },
  
  longPress: {
    minDuration: 500,     // Minimum long press duration (ms)
    maxMovement: 10,      // Maximum movement during long press (px)
    feedbackDelay: 100    // Haptic feedback delay (ms)
  },
  
  swipe: {
    minDistance: 50,      // Minimum swipe distance (px)
    maxDuration: 300,     // Maximum swipe duration (ms)
    minVelocity: 150      // Minimum swipe velocity (px/s)
  },
  
  pinch: {
    minScale: 0.5,        // Minimum pinch scale
    maxScale: 3.0,        // Maximum pinch scale
    sensitivity: 0.02     // Pinch sensitivity
  },
  
  scroll: {
    momentum: true,       // Enable momentum scrolling
    bounce: true,         // Enable bounce effect
    snapToGrid: false,    // Snap scrolling to grid
    friction: 0.92        // Scroll friction coefficient
  }
} as const;

// Device-specific touch optimizations
export const DEVICE_TOUCH_CONFIG = {
  mobile: {
    touchTargets: TOUCH_TARGETS.universal,
    gestures: ['tap', 'longPress', 'swipe', 'pinch', 'scroll'],
    hapticFeedback: true,
    contextMenus: 'longPress',
    hoverStates: false,
    cursorPointer: false
  },
  
  tablet: {
    touchTargets: TOUCH_TARGETS.universal,
    gestures: ['tap', 'longPress', 'swipe', 'pinch', 'scroll'],
    hapticFeedback: true,
    contextMenus: 'longPress',
    hoverStates: false,
    cursorPointer: false
  },
  
  desktop: {
    touchTargets: TOUCH_TARGETS.web,
    gestures: ['tap', 'scroll'],
    hapticFeedback: false,
    contextMenus: 'rightClick',
    hoverStates: true,
    cursorPointer: true
  },
  
  hybrid: {
    touchTargets: TOUCH_TARGETS.universal,
    gestures: ['tap', 'longPress', 'swipe', 'scroll'],
    hapticFeedback: true,
    contextMenus: 'both',
    hoverStates: true,
    cursorPointer: true
  }
} as const;

// Color contrast utilities for accessibility
export const COLOR_CONTRAST = {
  // Calculate relative luminance (WCAG formula)
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const l1 = COLOR_CONTRAST.getLuminance(...color1);
    const l2 = COLOR_CONTRAST.getLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  // Check if contrast meets WCAG standards
  meetsStandard: (ratio: number, level: 'A' | 'AA' | 'AAA' = 'AA'): boolean => {
    const requirements = { A: 3.0, AA: 4.5, AAA: 7.0 };
    return ratio >= requirements[level];
  },
  
  // Predefined accessible color pairs
  accessiblePairs: {
    // High contrast pairs (WCAG AAA)
    highContrast: [
      { background: [255, 255, 255], text: [0, 0, 0], ratio: 21 },
      { background: [0, 0, 0], text: [255, 255, 255], ratio: 21 },
      { background: [255, 255, 255], text: [68, 68, 68], ratio: 7.72 },
      { background: [248, 248, 248], text: [51, 51, 51], ratio: 8.32 }
    ],
    
    // Standard contrast pairs (WCAG AA)
    standardContrast: [
      { background: [255, 255, 255], text: [117, 117, 117], ratio: 4.54 },
      { background: [245, 245, 245], text: [102, 102, 102], ratio: 4.73 },
      { background: [33, 150, 243], text: [255, 255, 255], ratio: 4.59 },
      { background: [76, 175, 80], text: [255, 255, 255], ratio: 4.51 }
    ]
  }
};

// Focus management utilities
export const FOCUS_MANAGEMENT = {
  // Focus trap for modal dialogs
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  // Restore focus to previous element
  restoreFocus: (previousElement: HTMLElement | null): void => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },
  
  // Skip links for keyboard navigation
  createSkipLink: (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    return skipLink;
  }
};

// Screen reader utilities
export const SCREEN_READER = {
  // Announce content to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Create screen reader only text
  createSROnly: (text: string): HTMLElement => {
    const srElement = document.createElement('span');
    srElement.className = 'sr-only';
    srElement.textContent = text;
    srElement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    return srElement;
  }
};

// Touch feedback and haptics
export const TOUCH_FEEDBACK = {
  // Visual feedback for touch interactions
  createRippleEffect: (element: HTMLElement, event: TouchEvent | MouseEvent): void => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event as TouchEvent).touches 
      ? (event as TouchEvent).touches[0].clientX - rect.left - size / 2
      : (event as MouseEvent).clientX - rect.left - size / 2;
    const y = (event as TouchEvent).touches 
      ? (event as TouchEvent).touches[0].clientY - rect.top - size / 2
      : (event as MouseEvent).clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },
  
  // Haptic feedback (if supported)
  vibrate: (pattern: number | number[] = 50): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },
  
  // Audio feedback
  playTouchSound: (frequency: number = 800, duration: number = 100): void => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    }
  }
};

export type TouchTargetPlatform = keyof typeof TOUCH_TARGETS;
export type AccessibilityLevel = keyof typeof ACCESSIBILITY_LEVELS;
export type TouchGesture = keyof typeof TOUCH_GESTURES;
export type DeviceTouchType = keyof typeof DEVICE_TOUCH_CONFIG;
