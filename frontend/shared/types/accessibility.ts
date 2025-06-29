// Accessibility Types for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Comprehensive type definitions

export interface AccessibilityConfig {
  level: 'A' | 'AA' | 'AAA';
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  colorContrastRatio: number;
  minimumTouchTarget: number;
  focusVisibleOutlineWidth: number;
}

export interface WCAGComplianceLevel {
  level: 'A' | 'AA' | 'AAA';
  colorContrast: {
    normal: number;
    large: number;
  };
  touchTargets: {
    minimum: number;
    recommended: number;
    spacing: number;
  };
  requirements: {
    keyboardAccess: boolean;
    screenReaderSupport: boolean;
    focusManagement: boolean;
    colorIndependence: boolean;
    textAlternatives: boolean;
    semanticMarkup: boolean;
  };
}

export interface SemanticElement {
  tag: keyof HTMLElementTagNameMap;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  ariaLevel?: number;
  ariaExpanded?: boolean;
  ariaHidden?: boolean;
  tabIndex?: number;
}

export interface KeyboardNavigation {
  enableTabOrder: boolean;
  enableArrowNavigation: boolean;
  enableEscapeKey: boolean;
  enableEnterSpaceActivation: boolean;
  skipLinks: SkipLink[];
  shortcuts: KeyboardShortcut[];
}

export interface SkipLink {
  id: string;
  label: string;
  target: string;
  order: number;
}

export interface KeyboardShortcut {
  key: string;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  action: string;
  description: string;
  element?: string;
}

export interface ScreenReaderConfig {
  announcePageChanges: boolean;
  announceFormErrors: boolean;
  announceStatusUpdates: boolean;
  liveRegionPoliteness: 'off' | 'polite' | 'assertive';
  enableDescriptiveText: boolean;
  enableLandmarkNavigation: boolean;
}

export interface ColorContrastTest {
  foreground: string;
  background: string;
  ratio: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  passes: boolean;
  size: 'normal' | 'large';
}

export interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  category: 'structure' | 'keyboard' | 'screen-reader' | 'visual' | 'interaction';
  wcagCriterion: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'pass' | 'fail' | 'warning' | 'manual';
  automated: boolean;
  result?: any;
  recommendations?: string[];
}

export interface AccessibilityAudit {
  timestamp: number;
  url: string;
  tests: AccessibilityTest[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    manual: number;
    score: number;
  };
  wcagCompliance: {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
  };
}

export interface FocusManagement {
  trapFocus: boolean;
  restoreFocus: boolean;
  skipToContent: boolean;
  visibleFocusIndicator: boolean;
  focusOutlineStyle: {
    width: number;
    style: string;
    color: string;
    offset: number;
  };
}

export interface ReducedMotionPreferences {
  prefersReducedMotion: boolean;
  disableAnimations: boolean;
  disableTransitions: boolean;
  disableParallax: boolean;
  enableSimpleTransitions: boolean;
}

export interface AccessibilityFeatures {
  screenMagnifier: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  eyeTracking: boolean;
  highContrastMode: boolean;
  darkMode: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  captionsEnabled: boolean;
  audioDescriptions: boolean;
}

export interface AccessibilityContext {
  config: AccessibilityConfig;
  features: AccessibilityFeatures;
  navigation: KeyboardNavigation;
  screenReader: ScreenReaderConfig;
  focusManagement: FocusManagement;
  motionPreferences: ReducedMotionPreferences;
  currentFocus?: HTMLElement;
  announcements: string[];
}

export interface AccessibilityError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  element?: HTMLElement;
  criterion: string;
  suggestion: string;
} 