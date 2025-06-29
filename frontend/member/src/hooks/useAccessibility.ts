// Accessibility Hook for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - React hook for accessibility features

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  AccessibilityConfig, 
  AccessibilityContext, 
  AccessibilityTest,
  KeyboardNavigation,
  ScreenReaderConfig,
  FocusManagement 
} from "../types/accessibility";
import { 
  DEFAULT_ACCESSIBILITY_CONFIG, 
  DEFAULT_KEYBOARD_NAVIGATION, 
  DEFAULT_SCREEN_READER_CONFIG 
} from "../config/accessibility";
import { 
  runAccessibilityAudit, 
  announceToScreenReader, 
  trapFocus, 
  detectMotionPreferences,
  createSkipLink 
} from "../utils/accessibility";

export function useAccessibility(config: Partial<AccessibilityConfig> = {}) {
  const [accessibilityContext, setAccessibilityContext] = useState<AccessibilityContext>({
    config: { ...DEFAULT_ACCESSIBILITY_CONFIG, ...config },
    navigation: DEFAULT_KEYBOARD_NAVIGATION,
    screenReader: DEFAULT_SCREEN_READER_CONFIG,
    focusManagement: {
      trapFocus: true,
      restoreFocus: true,
      skipToContent: true,
      visibleFocusIndicator: true,
      focusOutlineStyle: {
        width: 2,
        style: "solid",
        color: "#005FCC",
        offset: 2,
      },
    },
    announcements: [],
  });

  const [auditResults, setAuditResults] = useState<AccessibilityTest[]>([]);
  const [isAuditRunning, setIsAuditRunning] = useState(false);
  const focusRestoreRef = useRef<HTMLElement | null>(null);

  // Initialize accessibility preferences
  useEffect(() => {
    const motionPrefs = detectMotionPreferences();
    
    if (motionPrefs.prefersReducedMotion) {
      setAccessibilityContext(prev => ({
        ...prev,
        config: {
          ...prev.config,
          enableReducedMotion: true,
        },
      }));

      // Add reduced motion CSS
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (motionPrefs.prefersHighContrast) {
      setAccessibilityContext(prev => ({
        ...prev,
        config: {
          ...prev.config,
          enableHighContrast: true,
        },
      }));
    }
  }, []);

  // Create skip links
  useEffect(() => {
    if (accessibilityContext.navigation.skipLinks.length > 0) {
      const existingSkipLinks = document.querySelectorAll(".skip-link");
      existingSkipLinks.forEach(link => link.remove());

      accessibilityContext.navigation.skipLinks.forEach(skipLinkConfig => {
        const skipLink = createSkipLink(
          skipLinkConfig.target.replace("#", ""),
          skipLinkConfig.label
        );
        document.body.insertBefore(skipLink, document.body.firstChild);
      });
    }
  }, [accessibilityContext.navigation.skipLinks]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!accessibilityContext.config.enableKeyboardNavigation) return;

    const handleKeydown = (e: KeyboardEvent) => {
      const { shortcuts } = accessibilityContext.navigation;
      
      shortcuts.forEach(shortcut => {
        if (e.key === shortcut.key) {
          if (!shortcut.modifier || e[`${shortcut.modifier}Key` as keyof KeyboardEvent]) {
            e.preventDefault();
            handleKeyboardAction(shortcut.action);
          }
        }
      });

      // Handle Escape key for modal/dialog closing
      if (e.key === "Escape") {
        const modals = document.querySelectorAll("[role=\"dialog\"], [role=\"alertdialog\"]");
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector("[data-close], [aria-label*=\"close\"], [aria-label*=\"Close\"]") as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [accessibilityContext]);

  // Focus management
  const manageFocus = useCallback({
    saveFocus: () => {
      focusRestoreRef.current = document.activeElement as HTMLElement;
    },
    
    restoreFocus: () => {
      if (focusRestoreRef.current && typeof focusRestoreRef.current.focus === "function") {
        focusRestoreRef.current.focus();
        focusRestoreRef.current = null;
      }
    },
    
    trapFocusInContainer: (container: HTMLElement) => {
      return trapFocus(container);
    },
    
    focusFirstElement: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex=\"-1\"])"
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    },
  }, []);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (accessibilityContext.config.enableScreenReader) {
      announceToScreenReader(message, priority);
      setAccessibilityContext(prev => ({
        ...prev,
        announcements: [...prev.announcements.slice(-4), message], // Keep last 5 announcements
      }));
    }
  }, [accessibilityContext.config.enableScreenReader]);

  // Accessibility audit
  const runAudit = useCallback(async (element: HTMLElement = document.body) => {
    setIsAuditRunning(true);
    try {
      const results = runAccessibilityAudit(element);
      setAuditResults(results);
      
      const failedTests = results.filter(test => test.status === "fail");
      if (failedTests.length > 0) {
        announce(`Accessibility audit completed. ${failedTests.length} issues found.`, "assertive");
      } else {
        announce("Accessibility audit completed. No issues found.", "polite");
      }
      
      return results;
    } finally {
      setIsAuditRunning(false);
    }
  }, [announce]);

  // Keyboard action handler
  const handleKeyboardAction = useCallback((action: string) => {
    switch (action) {
      case "focus-search":
        const searchInput = document.querySelector("input[type=\"search\"], input[placeholder*=\"search\"], input[placeholder*=\"Search\"]") as HTMLElement;
        if (searchInput) {
          searchInput.focus();
          announce("Search input focused");
        }
        break;
        
      case "go-home":
        window.location.href = "/";
        break;
        
      case "go-dashboard":
        window.location.href = "/dashboard";
        break;
        
      case "show-help":
        announce("Keyboard shortcuts: / for search, h for home, d for dashboard, Escape to close dialogs");
        break;
        
      case "close-modal":
        // Handled in the keydown event listener
        break;
        
      default:
        console.log(`Unknown keyboard action: ${action}`);
    }
  }, [announce]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AccessibilityConfig>) => {
    setAccessibilityContext(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }));
    
    announce("Accessibility settings updated");
  }, [announce]);

  // Get current accessibility score
  const getAccessibilityScore = useCallback(() => {
    if (auditResults.length === 0) return 100;
    
    const passedTests = auditResults.filter(test => test.status === "pass").length;
    return Math.round((passedTests / auditResults.length) * 100);
  }, [auditResults]);

  return {
    // State
    config: accessibilityContext.config,
    auditResults,
    isAuditRunning,
    announcements: accessibilityContext.announcements,
    
    // Actions
    announce,
    runAudit,
    updateConfig,
    manageFocus,
    
    // Computed
    accessibilityScore: getAccessibilityScore(),
    isWCAGCompliant: getAccessibilityScore() >= 85,
  };
}

// Hook for keyboard navigation only
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    let isTabPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        isTabPressed = true;
        setIsKeyboardUser(true);
      }
      if (e.key === "Escape") {
        isTabPressed = false;
      }
    };

    const handleMouseDown = () => {
      if (isTabPressed) {
        setIsKeyboardUser(false);
        isTabPressed = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return { isKeyboardUser };
}

export default useAccessibility;
