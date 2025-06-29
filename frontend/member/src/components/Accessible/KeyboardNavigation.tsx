// Keyboard Navigation Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 2: Keyboard Navigation

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DEFAULT_KEYBOARD_NAVIGATION } from "../../config/accessibility";
import { announceToScreenReader } from "../../utils/accessibility";

interface KeyboardNavigationProps {
  children: React.ReactNode;
  enableShortcuts?: boolean;
  enableFocusTrap?: boolean;
  enableArrowNavigation?: boolean;
  onShortcut?: (shortcut: string) => void;
  className?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  enableShortcuts = true,
  enableFocusTrap = false,
  enableArrowNavigation = true,
  onShortcut,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [keyboardUser, setKeyboardUser] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // Get focusable elements
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
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
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements();
      
      // Track keyboard usage
      if (e.key === "Tab") {
        setKeyboardUser(true);
      }

      // Handle shortcuts
      if (enableShortcuts) {
        DEFAULT_KEYBOARD_NAVIGATION.shortcuts.forEach(shortcut => {
          if (e.key === shortcut.key) {
            // Handle modifier keys
            if (shortcut.modifier) {
              const modifierPressed = e[`${shortcut.modifier}Key` as keyof KeyboardEvent] as boolean;
              if (!modifierPressed) return;
            }
            
            e.preventDefault();
            handleShortcutAction(shortcut.action, shortcut.description);
            if (onShortcut) onShortcut(shortcut.action);
          }
        });
      }

      // Handle arrow navigation within container
      if (enableArrowNavigation && containerRef.current?.contains(e.target as Node)) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          
          if (focusableElements.length === 0) return;
          
          let nextIndex = focusedIndex;
          
          if (e.key === "ArrowDown") {
            nextIndex = focusedIndex < focusableElements.length - 1 ? focusedIndex + 1 : 0;
          } else if (e.key === "ArrowUp") {
            nextIndex = focusedIndex > 0 ? focusedIndex - 1 : focusableElements.length - 1;
          }
          
          setFocusedIndex(nextIndex);
          focusableElements[nextIndex]?.focus();
          announceToScreenReader(`Focused on ${focusableElements[nextIndex]?.getAttribute("aria-label") || focusableElements[nextIndex]?.textContent || "element"}`);
        }
      }

      // Focus trap
      if (enableFocusTrap && e.key === "Tab") {
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
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

      // Escape key handling
      if (e.key === "Escape") {
        if (helpVisible) {
          setHelpVisible(false);
          announceToScreenReader("Help dialog closed");
        }
        
        // Focus trap escape
        if (enableFocusTrap) {
          const activeElement = document.activeElement as HTMLElement;
          if (containerRef.current?.contains(activeElement)) {
            activeElement.blur();
            announceToScreenReader("Focus trap released");
          }
        }
      }
    };

    const handleMouseDown = () => {
      setKeyboardUser(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [enableShortcuts, enableFocusTrap, enableArrowNavigation, focusedIndex, helpVisible, getFocusableElements, onShortcut]);

  // Handle shortcut actions
  const handleShortcutAction = (action: string, description: string) => {
    switch (action) {
      case "focus-search":
        const searchInput = document.querySelector("input[type=\"search\"], input[placeholder*=\"search\"], input[placeholder*=\"Search\"]") as HTMLElement;
        if (searchInput) {
          searchInput.focus();
          announceToScreenReader("Search input focused");
        } else {
          announceToScreenReader("No search input found");
        }
        break;
        
      case "go-home":
        announceToScreenReader("Navigating to homepage");
        window.location.href = "/";
        break;
        
      case "go-dashboard":
        announceToScreenReader("Navigating to dashboard");
        window.location.href = "/dashboard";
        break;
        
      case "show-help":
        setHelpVisible(!helpVisible);
        announceToScreenReader(helpVisible ? "Help dialog closed" : "Help dialog opened");
        break;
        
      case "close-modal":
        const modals = document.querySelectorAll("[role=\"dialog\"], [role=\"alertdialog\"]");
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector("[data-close], [aria-label*=\"close\"], [aria-label*=\"Close\"]") as HTMLElement;
          if (closeButton) {
            closeButton.click();
            announceToScreenReader("Dialog closed");
          }
        }
        break;
        
      default:
        announceToScreenReader(description);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`keyboard-navigation-container ${keyboardUser ? "keyboard-user" : ""} ${className}`}
      onFocus={() => setKeyboardUser(true)}
    >
      {/* Keyboard shortcuts help */}
      {helpVisible && (
        <div
          role="dialog"
          aria-labelledby="keyboard-help-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 id="keyboard-help-title" className="text-lg font-semibold text-gray-900 mb-4">
              Keyboard Shortcuts
            </h2>
            
            <div className="space-y-3">
              {DEFAULT_KEYBOARD_NAVIGATION.shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {shortcut.modifier && `${shortcut.modifier.toUpperCase()} + `}{shortcut.key}
                  </span>
                  <span className="text-sm text-gray-600 ml-4">
                    {shortcut.description}
                  </span>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">Tab</span>
                  <span className="text-sm text-gray-600 ml-4">Navigate forward</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">Shift + Tab</span>
                  <span className="text-sm text-gray-600 ml-4">Navigate backward</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">↑↓</span>
                  <span className="text-sm text-gray-600 ml-4">Arrow navigation</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">Enter/Space</span>
                  <span className="text-sm text-gray-600 ml-4">Activate element</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setHelpVisible(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {children}
      
      {/* Focus indicator styles */}
      <style jsx>{`
        .keyboard-navigation-container.keyboard-user *:focus {
          outline: 2px solid #005FCC !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
        }
        
        .keyboard-navigation-container:not(.keyboard-user) *:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

export default KeyboardNavigation;
