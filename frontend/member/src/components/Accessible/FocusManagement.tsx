// Focus Management Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 2: Focus Management

import React, { useRef, useEffect, useCallback } from "react";
import { FOCUS_MANAGEMENT_CONFIG } from "../../config/accessibility";

interface FocusManagementProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  restoreOnUnmount?: boolean;
  trapFocus?: boolean;
  className?: string;
}

export const FocusManagement: React.FC<FocusManagementProps> = ({
  children,
  autoFocus = false,
  restoreOnUnmount = true,
  trapFocus = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Save current focus when component mounts
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      // Restore focus when component unmounts
      if (restoreOnUnmount && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [autoFocus, restoreOnUnmount]);

  // Get focusable elements
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
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
  }, []);

  // Focus trap implementation
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [trapFocus, getFocusableElements]);

  // Focus management methods
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;
    const firstFocusable = getFocusableElements(containerRef.current)[0];
    if (firstFocusable) firstFocusable.focus();
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;
    const focusableElements = getFocusableElements(containerRef.current);
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (lastFocusable) lastFocusable.focus();
  }, [getFocusableElements]);

  return (
    <div
      ref={containerRef}
      className={`focus-management-container ${className}`}
      data-focus-trap={trapFocus}
    >
      {children}
      
      {/* Focus styles */}
      <style jsx>{`
        .focus-management-container *:focus {
          outline: ${FOCUS_MANAGEMENT_CONFIG.outlineWidth}px ${FOCUS_MANAGEMENT_CONFIG.outlineStyle} ${FOCUS_MANAGEMENT_CONFIG.outlineColor} !important;
          outline-offset: ${FOCUS_MANAGEMENT_CONFIG.outlineOffset}px !important;
          border-radius: ${FOCUS_MANAGEMENT_CONFIG.borderRadius}px !important;
          transition: outline ${FOCUS_MANAGEMENT_CONFIG.transitionDuration} ${FOCUS_MANAGEMENT_CONFIG.transitionTimingFunction} !important;
        }
        
        .focus-management-container *:focus:not(:focus-visible) {
          outline: none !important;
        }
        
        .focus-management-container *:focus-visible {
          outline: ${FOCUS_MANAGEMENT_CONFIG.outlineWidth}px ${FOCUS_MANAGEMENT_CONFIG.outlineStyle} ${FOCUS_MANAGEMENT_CONFIG.outlineColor} !important;
          outline-offset: ${FOCUS_MANAGEMENT_CONFIG.outlineOffset}px !important;
        }
      `}</style>
    </div>
  );
};

// Hook for imperative focus management
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    focusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusRef.current && typeof focusRef.current.focus === "function") {
      focusRef.current.focus();
      focusRef.current = null;
    }
  }, []);

  const moveFocusTo = useCallback((element: HTMLElement | string) => {
    if (typeof element === "string") {
      const targetElement = document.querySelector(element) as HTMLElement;
      if (targetElement) targetElement.focus();
    } else {
      element.focus();
    }
  }, []);

  const trapFocusIn = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex=\"-1\"])"
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
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

    container.addEventListener("keydown", handleKeyDown);
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    moveFocusTo,
    trapFocusIn,
  };
};

export default FocusManagement;
