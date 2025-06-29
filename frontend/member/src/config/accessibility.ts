// Accessibility Configuration for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Configuration and standards

import { AccessibilityConfig, WCAGComplianceLevel, KeyboardNavigation, ScreenReaderConfig } from "../types/accessibility";

// WCAG 2.1 Compliance Levels
export const WCAG_COMPLIANCE_LEVELS: Record<string, WCAGComplianceLevel> = {
  A: {
    level: "A",
    colorContrast: {
      normal: 3.0,
      large: 3.0,
    },
    touchTargets: {
      minimum: 24,
      recommended: 44,
      spacing: 2,
    },
    requirements: {
      keyboardAccess: true,
      screenReaderSupport: true,
      focusManagement: true,
      colorIndependence: false,
      textAlternatives: true,
      semanticMarkup: true,
    },
  },
  AA: {
    level: "AA",
    colorContrast: {
      normal: 4.5,
      large: 3.0,
    },
    touchTargets: {
      minimum: 44,
      recommended: 48,
      spacing: 8,
    },
    requirements: {
      keyboardAccess: true,
      screenReaderSupport: true,
      focusManagement: true,
      colorIndependence: true,
      textAlternatives: true,
      semanticMarkup: true,
    },
  },
  AAA: {
    level: "AAA",
    colorContrast: {
      normal: 7.0,
      large: 4.5,
    },
    touchTargets: {
      minimum: 48,
      recommended: 56,
      spacing: 12,
    },
    requirements: {
      keyboardAccess: true,
      screenReaderSupport: true,
      focusManagement: true,
      colorIndependence: true,
      textAlternatives: true,
      semanticMarkup: true,
    },
  },
};

// Default Accessibility Configuration (WCAG 2.1 AA)
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  level: "AA",
  enableScreenReader: true,
  enableKeyboardNavigation: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  enableLargeText: false,
  colorContrastRatio: 4.5,
  minimumTouchTarget: 44,
  focusVisibleOutlineWidth: 2,
};

// Keyboard Navigation Configuration
export const DEFAULT_KEYBOARD_NAVIGATION: KeyboardNavigation = {
  enableTabOrder: true,
  enableArrowNavigation: true,
  enableEscapeKey: true,
  enableEnterSpaceActivation: true,
  skipLinks: [
    {
      id: "skip-to-main",
      label: "Skip to main content",
      target: "#main-content",
      order: 1,
    },
    {
      id: "skip-to-nav",
      label: "Skip to navigation",
      target: "#main-navigation",
      order: 2,
    },
    {
      id: "skip-to-footer",
      label: "Skip to footer",
      target: "#main-footer",
      order: 3,
    },
  ],
  shortcuts: [
    {
      key: "/",
      action: "focus-search",
      description: "Focus search input",
    },
    {
      key: "h",
      action: "go-home",
      description: "Go to homepage",
    },
    {
      key: "d",
      action: "go-dashboard",
      description: "Go to dashboard",
    },
    {
      key: "?",
      action: "show-help",
      description: "Show keyboard shortcuts",
    },
    {
      key: "Escape",
      action: "close-modal",
      description: "Close modal or dialog",
    },
  ],
};

// Screen Reader Configuration
export const DEFAULT_SCREEN_READER_CONFIG: ScreenReaderConfig = {
  announcePageChanges: true,
  announceFormErrors: true,
  announceStatusUpdates: true,
  liveRegionPoliteness: "polite",
  enableDescriptiveText: true,
  enableLandmarkNavigation: true,
};

// Semantic HTML Element Mapping
export const SEMANTIC_ELEMENT_MAP = {
  navigation: {
    tag: "nav" as const,
    role: "navigation",
    ariaLabel: "Main navigation",
  },
  main: {
    tag: "main" as const,
    role: "main",
    ariaLabel: "Main content",
  },
  header: {
    tag: "header" as const,
    role: "banner",
    ariaLabel: "Page header",
  },
  footer: {
    tag: "footer" as const,
    role: "contentinfo",
    ariaLabel: "Page footer",
  },
  sidebar: {
    tag: "aside" as const,
    role: "complementary",
    ariaLabel: "Sidebar content",
  },
  search: {
    tag: "section" as const,
    role: "search",
    ariaLabel: "Search",
  },
  form: {
    tag: "form" as const,
    role: "form",
    ariaLabel: "Form",
  },
  article: {
    tag: "article" as const,
    role: "article",
    ariaLabel: "Article content",
  },
  section: {
    tag: "section" as const,
    role: "region",
    ariaLabel: "Content section",
  },
};

// Focus Management Configuration
export const FOCUS_MANAGEMENT_CONFIG = {
  outlineWidth: 2,
  outlineStyle: "solid",
  outlineColor: "#005FCC",
  outlineOffset: 2,
  borderRadius: 4,
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease-in-out",
};

// Touch Target Standards
export const TOUCH_TARGET_STANDARDS = {
  MINIMUM_SIZE: 44, // WCAG 2.1 AA minimum
  RECOMMENDED_SIZE: 48, // iOS/Android recommendation
  LARGE_SIZE: 56, // Material Design large
  MINIMUM_SPACING: 8, // Minimum gap between targets
  RECOMMENDED_SPACING: 12, // Recommended gap
};
