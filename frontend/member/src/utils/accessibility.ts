// Accessibility Utilities for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 1: Semantic HTML Structure

import { AccessibilityTest, AccessibilityError } from "../types/accessibility";

// Color Contrast Calculation
export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Semantic HTML Validation
export function validateHeadingHierarchy(element: HTMLElement): AccessibilityError[] {
  const errors: AccessibilityError[] = [];
  const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
  
  let previousLevel = 0;
  let h1Count = 0;
  
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (currentLevel === 1) {
      h1Count++;
      if (h1Count > 1) {
        errors.push({
          code: "MULTIPLE_H1",
          message: "Multiple H1 elements found. Only one H1 should be present per page.",
          severity: "error",
          element: heading as HTMLElement,
          criterion: "1.3.1 Info and Relationships",
          suggestion: "Use only one H1 element per page for the main heading.",
        });
      }
    }
    
    if (index > 0) {
      const levelDifference = currentLevel - previousLevel;
      if (levelDifference > 1) {
        errors.push({
          code: "HEADING_SKIP",
          message: `Heading level skipped from H${previousLevel} to H${currentLevel}`,
          severity: "warning",
          element: heading as HTMLElement,
          criterion: "1.3.1 Info and Relationships",
          suggestion: `Use sequential heading levels. Consider using H${previousLevel + 1} instead.`,
        });
      }
    }
    
    previousLevel = currentLevel;
  });
  
  if (h1Count === 0) {
    errors.push({
      code: "MISSING_H1",
      message: "No H1 element found. Every page should have exactly one H1.",
      severity: "error",
      element: element,
      criterion: "1.3.1 Info and Relationships",
      suggestion: "Add an H1 element as the main heading of the page.",
    });
  }
  
  return errors;
}

// ARIA Labels and Roles Validation
export function validateARIA(element: HTMLElement): AccessibilityError[] {
  const errors: AccessibilityError[] = [];
  
  // Check for missing alt text on images
  const images = element.querySelectorAll("img");
  images.forEach((img) => {
    if (!img.getAttribute("alt") && !img.getAttribute("aria-hidden")) {
      errors.push({
        code: "MISSING_ALT_TEXT",
        message: "Image missing alternative text",
        severity: "error",
        element: img as HTMLElement,
        criterion: "1.1.1 Non-text Content",
        suggestion: "Add descriptive alt text or aria-hidden=\"true\" if decorative.",
      });
    }
  });
  
  // Check for form labels
  const inputs = element.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    const hasLabel = input.getAttribute("aria-label") || 
                     input.getAttribute("aria-labelledby") ||
                     element.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      errors.push({
        code: "MISSING_FORM_LABEL",
        message: "Form control missing accessible label",
        severity: "error",
        element: input as HTMLElement,
        criterion: "3.3.2 Labels or Instructions",
        suggestion: "Add a label element, aria-label, or aria-labelledby attribute.",
      });
    }
  });
  
  return errors;
}

// Focus Management
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "input:not([disabled]):not([type=\"hidden\"])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "a[href]",
    "area[href]",
    "[tabindex]:not([tabindex=\"-1\"])",
    "[contenteditable=\"true\"]",
  ].join(", ");
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
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
  
  container.addEventListener("keydown", handleTabKey);
  firstElement.focus();
  
  return () => {
    container.removeEventListener("keydown", handleTabKey);
  };
}

// Screen Reader Announcements
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

// Skip Link Creation
export function createSkipLink(target: string, label: string): HTMLAnchorElement {
  const skipLink = document.createElement("a");
  skipLink.href = `#${target}`;
  skipLink.textContent = label;
  skipLink.className = "skip-link absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden focus:static focus:w-auto focus:h-auto focus:p-2 focus:bg-black focus:text-white focus:z-50";
  
  return skipLink;
}

// Comprehensive Accessibility Audit
export function runAccessibilityAudit(element: HTMLElement): AccessibilityTest[] {
  const tests: AccessibilityTest[] = [];
  
  // Heading hierarchy test
  const headingErrors = validateHeadingHierarchy(element);
  tests.push({
    id: "heading-hierarchy",
    name: "Heading Hierarchy",
    description: "Validates proper heading structure and hierarchy",
    category: "structure",
    wcagCriterion: "1.3.1 Info and Relationships",
    level: "A",
    status: headingErrors.length === 0 ? "pass" : "fail",
    automated: true,
    result: headingErrors,
    recommendations: headingErrors.map(err => err.suggestion),
  });
  
  // ARIA validation test
  const ariaErrors = validateARIA(element);
  tests.push({
    id: "aria-validation",
    name: "ARIA Labels and Roles",
    description: "Validates ARIA attributes and accessibility labels",
    category: "screen-reader",
    wcagCriterion: "4.1.2 Name, Role, Value",
    level: "A",
    status: ariaErrors.length === 0 ? "pass" : "fail",
    automated: true,
    result: ariaErrors,
    recommendations: ariaErrors.map(err => err.suggestion),
  });
  
  return tests;
}

// Motion Preferences Detection
export function detectMotionPreferences() {
  if (typeof window === "undefined") {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersDarkMode: false,
    };
  }
  
  return {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    prefersHighContrast: window.matchMedia("(prefers-contrast: high)").matches,
    prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}


// Export aliases for test compatibility
export const calculateColorContrast = calculateContrastRatio;
export const validateAriaAttributes = validateARIA;
export const checkKeyboardNavigation = getFocusableElements;

// Missing utility function
export function getAccessibilityScore(auditResults: any[]): number {
  if (!auditResults || auditResults.length === 0) {
    return 100; // Perfect score for no tests
  }

  let score = 0;
  auditResults.forEach(result => {
    if (result.status === "pass") {
      score += result.automated ? 1 : 0.8;
    } else if (result.status === "warning") {
      score += result.automated ? 0.5 : 0.4;
    }
  });

  const maxPossibleScore = auditResults.reduce((total, result) => {
    return total + (result.automated ? 1 : 0.8);
  }, 0);

  return Math.round((score / maxPossibleScore) * 100);
}
