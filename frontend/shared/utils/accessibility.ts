// Accessibility Utilities for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Core utility functions

import { 
  AccessibilityConfig, 
  ColorContrastTest, 
  AccessibilityTest, 
  SemanticElement,
  AccessibilityError,
  WCAGComplianceLevel 
} from '../types/accessibility';
import { 
  WCAG_COMPLIANCE_LEVELS, 
  COLOR_CONTRAST_STANDARDS,
  HEADING_HIERARCHY,
  TOUCH_TARGET_STANDARDS 
} from '../config/accessibility';

// Color Contrast Calculation
export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Test Color Contrast Compliance
export function testColorContrast(
  foreground: string, 
  background: string, 
  size: 'normal' | 'large' = 'normal',
  level: 'A' | 'AA' | 'AAA' = 'AA'
): ColorContrastTest {
  const ratio = calculateContrastRatio(foreground, background);
  const compliance = WCAG_COMPLIANCE_LEVELS[level];
  const requiredRatio = size === 'large' ? compliance.colorContrast.large : compliance.colorContrast.normal;

  return {
    foreground,
    background,
    ratio: Math.round(ratio * 100) / 100,
    wcagLevel: level,
    passes: ratio >= requiredRatio,
    size,
  };
}

// Semantic HTML Validation
export function validateHeadingHierarchy(element: HTMLElement): AccessibilityError[] {
  const errors: AccessibilityError[] = [];
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let previousLevel = 0;
  let h1Count = 0;
  
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    // Check for H1 requirement
    if (currentLevel === 1) {
      h1Count++;
      if (h1Count > 1 && HEADING_HIERARCHY.maxH1Count === 1) {
        errors.push({
          code: 'MULTIPLE_H1',
          message: 'Multiple H1 elements found. Only one H1 should be present per page.',
          severity: 'error',
          element: heading as HTMLElement,
          criterion: '1.3.1 Info and Relationships',
          suggestion: 'Use only one H1 element per page for the main heading.',
        });
      }
    }
    
    // Check for sequential order
    if (HEADING_HIERARCHY.sequentialOrder && index > 0) {
      const levelDifference = currentLevel - previousLevel;
      if (levelDifference > 1) {
        errors.push({
          code: 'HEADING_SKIP',
          message: `Heading level skipped from H${previousLevel} to H${currentLevel}`,
          severity: 'warning',
          element: heading as HTMLElement,
          criterion: '1.3.1 Info and Relationships',
          suggestion: `Use sequential heading levels. Consider using H${previousLevel + 1} instead.`,
        });
      }
    }
    
    previousLevel = currentLevel;
  });
  
  // Check for H1 requirement
  if (HEADING_HIERARCHY.requireH1 && h1Count === 0) {
    errors.push({
      code: 'MISSING_H1',
      message: 'No H1 element found. Every page should have exactly one H1.',
      severity: 'error',
      element: element,
      criterion: '1.3.1 Info and Relationships',
      suggestion: 'Add an H1 element as the main heading of the page.',
    });
  }
  
  return errors;
}

// Validate Touch Target Sizes
export function validateTouchTargets(element: HTMLElement): AccessibilityError[] {
  const errors: AccessibilityError[] = [];
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const minSize = TOUCH_TARGET_STANDARDS.MINIMUM_SIZE;
    
    if (rect.width < minSize || rect.height < minSize) {
      errors.push({
        code: 'TOUCH_TARGET_TOO_SMALL',
        message: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}px. Minimum size is ${minSize}x${minSize}px.`,
        severity: 'error',
        element: el as HTMLElement,
        criterion: '2.5.5 Target Size',
        suggestion: `Increase the size to at least ${minSize}x${minSize}px or add adequate padding.`,
      });
    }
  });
  
  return errors;
}

// Validate ARIA Labels and Roles
export function validateARIA(element: HTMLElement): AccessibilityError[] {
  const errors: AccessibilityError[] = [];
  
  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-hidden')) {
      errors.push({
        code: 'MISSING_ALT_TEXT',
        message: 'Image missing alternative text',
        severity: 'error',
        element: img,
        criterion: '1.1.1 Non-text Content',
        suggestion: 'Add descriptive alt text or aria-hidden="true" if decorative.',
      });
    }
  });
  
  // Check for form labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const hasLabel = input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby') ||
                     element.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      errors.push({
        code: 'MISSING_FORM_LABEL',
        message: 'Form control missing accessible label',
        severity: 'error',
        element: input as HTMLElement,
        criterion: '3.3.2 Labels or Instructions',
        suggestion: 'Add a label element, aria-label, or aria-labelledby attribute.',
      });
    }
  });
  
  // Check for interactive elements without accessible names
  const interactive = element.querySelectorAll('button, a, [role="button"]');
  interactive.forEach((el) => {
    const hasAccessibleName = el.textContent?.trim() ||
                             el.getAttribute('aria-label') ||
                             el.getAttribute('aria-labelledby') ||
                             el.querySelector('img')?.getAttribute('alt');
    
    if (!hasAccessibleName) {
      errors.push({
        code: 'MISSING_ACCESSIBLE_NAME',
        message: 'Interactive element missing accessible name',
        severity: 'error',
        element: el as HTMLElement,
        criterion: '4.1.2 Name, Role, Value',
        suggestion: 'Add visible text, aria-label, or aria-labelledby attribute.',
      });
    }
  });
  
  return errors;
}

// Keyboard Navigation Utilities
export function isElementFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector)) ||
         (element.getAttribute('tabindex') !== null && element.getAttribute('tabindex') !== '-1');
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
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
  };
  
  container.addEventListener('keydown', handleTabKey);
  firstElement.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

// Screen Reader Announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Skip Link Management
export function createSkipLink(target: string, label: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${target}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: 9999;
      padding: 8px 16px;
      background: #000;
      color: #fff;
      text-decoration: none;
      font-weight: bold;
    `;
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
  });
  
  return skipLink;
}

// Motion Preferences Detection
export function detectMotionPreferences(): {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersDarkMode: false,
    };
  }
  
  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
}

// Comprehensive Accessibility Audit
export function runAccessibilityAudit(element: HTMLElement): AccessibilityTest[] {
  const tests: AccessibilityTest[] = [];
  
  // Heading hierarchy test
  const headingErrors = validateHeadingHierarchy(element);
  tests.push({
    id: 'heading-hierarchy',
    name: 'Heading Hierarchy',
    description: 'Validates proper heading structure and hierarchy',
    category: 'structure',
    wcagCriterion: '1.3.1 Info and Relationships',
    level: 'A',
    status: headingErrors.length === 0 ? 'pass' : 'fail',
    automated: true,
    result: headingErrors,
    recommendations: headingErrors.map(err => err.suggestion),
  });
  
  // Touch target test
  const touchErrors = validateTouchTargets(element);
  tests.push({
    id: 'touch-targets',
    name: 'Touch Target Size',
    description: 'Validates minimum touch target sizes',
    category: 'interaction',
    wcagCriterion: '2.5.5 Target Size',
    level: 'AA',
    status: touchErrors.length === 0 ? 'pass' : 'fail',
    automated: true,
    result: touchErrors,
    recommendations: touchErrors.map(err => err.suggestion),
  });
  
  // ARIA validation test
  const ariaErrors = validateARIA(element);
  tests.push({
    id: 'aria-validation',
    name: 'ARIA Labels and Roles',
    description: 'Validates ARIA attributes and accessibility labels',
    category: 'screen-reader',
    wcagCriterion: '4.1.2 Name, Role, Value',
    level: 'A',
    status: ariaErrors.length === 0 ? 'pass' : 'fail',
    automated: true,
    result: ariaErrors,
    recommendations: ariaErrors.map(err => err.suggestion),
  });
  
  return tests;
}

// Export all utilities
export {
  calculateContrastRatio,
  testColorContrast,
  validateHeadingHierarchy,
  validateTouchTargets,
  validateARIA,
  isElementFocusable,
  getFocusableElements,
  trapFocus,
  announceToScreenReader,
  createSkipLink,
  detectMotionPreferences,
  runAccessibilityAudit,
}; 