// Visual Accessibility Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 4: Visual Accessibility

import React, { useState, useEffect, useRef } from "react";
import { calculateContrastRatio } from "../../utils/accessibility";

interface VisualAccessibilityProps {
  children: React.ReactNode;
  enableHighContrast?: boolean;
  enableLargeText?: boolean;
  enableReducedMotion?: boolean;
  className?: string;
}

export const VisualAccessibility: React.FC<VisualAccessibilityProps> = ({
  children,
  enableHighContrast = false,
  enableLargeText = false,
  enableReducedMotion = false,
  className = "",
}) => {
  const [preferences, setPreferences] = useState({
    highContrast: enableHighContrast,
    largeText: enableLargeText,
    reducedMotion: enableReducedMotion,
    darkMode: false,
  });

  // Detect user preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

      setPreferences(prev => ({
        ...prev,
        highContrast: prev.highContrast || prefersHighContrast,
        reducedMotion: prev.reducedMotion || prefersReducedMotion,
        darkMode: prefersDarkMode,
      }));
    }
  }, []);

  // Apply visual accessibility styles
  useEffect(() => {
    const styleId = "visual-accessibility-styles";
    let existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      existingStyle = document.createElement("style");
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    const styles = `
      ${preferences.highContrast ? `
        .visual-accessibility-container {
          filter: contrast(1.5) !important;
        }
        .visual-accessibility-container * {
          border-color: currentColor !important;
        }
      ` : ""}
      
      ${preferences.largeText ? `
        .visual-accessibility-container {
          font-size: 1.25em !important;
          line-height: 1.6 !important;
        }
        .visual-accessibility-container h1 { font-size: 2.5em !important; }
        .visual-accessibility-container h2 { font-size: 2em !important; }
        .visual-accessibility-container h3 { font-size: 1.75em !important; }
        .visual-accessibility-container button,
        .visual-accessibility-container input,
        .visual-accessibility-container select {
          font-size: 1.125em !important;
          padding: 12px 16px !important;
          min-height: 56px !important;
        }
      ` : ""}
      
      ${preferences.reducedMotion ? `
        .visual-accessibility-container *,
        .visual-accessibility-container *::before,
        .visual-accessibility-container *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      ` : ""}
      
      .visual-accessibility-container *:focus {
        outline: 3px solid #005FCC !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 95, 204, 0.3) !important;
      }
    `;

    existingStyle.textContent = styles;
  }, [preferences]);

  const togglePreference = (pref: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [pref]: !prev[pref] }));
  };

  return (
    <div className={`visual-accessibility-container ${className}`}>
      {/* Accessibility Controls */}
      <div className="accessibility-controls fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Visual Accessibility</h3>
        
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={preferences.highContrast}
            onChange={() => togglePreference("highContrast")}
            className="mr-2 w-4 h-4"
          />
          High Contrast
        </label>
        
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={preferences.largeText}
            onChange={() => togglePreference("largeText")}
            className="mr-2 w-4 h-4"
          />
          Large Text
        </label>
        
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={() => togglePreference("reducedMotion")}
            className="mr-2 w-4 h-4"
          />
          Reduced Motion
        </label>
      </div>

      {children}
    </div>
  );
};

// Color Contrast Checker Component
interface ColorContrastCheckerProps {
  foreground: string;
  background: string;
  size?: "normal" | "large";
  className?: string;
}

export const ColorContrastChecker: React.FC<ColorContrastCheckerProps> = ({
  foreground,
  background,
  size = "normal",
  className = "",
}) => {
  const ratio = calculateContrastRatio(foreground, background);
  const wcagAA = size === "large" ? 3.0 : 4.5;
  const wcagAAA = size === "large" ? 4.5 : 7.0;
  
  const passesAA = ratio >= wcagAA;
  const passesAAA = ratio >= wcagAAA;

  return (
    <div className={`color-contrast-checker ${className}`}>
      <div 
        className="p-4 rounded-lg border"
        style={{ backgroundColor: background, color: foreground }}
      >
        <h3 className="font-semibold mb-2">Sample Text</h3>
        <p className={size === "large" ? "text-lg" : "text-base"}>
          This text demonstrates the color contrast ratio of {ratio.toFixed(2)}:1
        </p>
        
        <div className="mt-3 space-y-1 text-sm">
          <div className={`inline-flex items-center px-2 py-1 rounded ${passesAA ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {passesAA ? "✓" : "✗"} WCAG AA ({wcagAA}:1)
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded ml-2 ${passesAAA ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {passesAAA ? "✓" : "✗"} WCAG AAA ({wcagAAA}:1)
          </div>
        </div>
      </div>
    </div>
  );
};

// Focus Indicator Component
interface FocusIndicatorProps {
  children: React.ReactNode;
  variant?: "default" | "high-contrast" | "custom";
  color?: string;
  width?: number;
  offset?: number;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  variant = "default",
  color = "#005FCC",
  width = 2,
  offset = 2,
}) => {
  const focusStyles = {
    default: {
      outline: `${width}px solid ${color}`,
      outlineOffset: `${offset}px`,
    },
    "high-contrast": {
      outline: "3px solid currentColor",
      outlineOffset: "2px",
      boxShadow: "0 0 0 5px rgba(255, 255, 255, 0.8), 0 0 0 7px rgba(0, 0, 0, 0.8)",
    },
    custom: {
      outline: `${width}px solid ${color}`,
      outlineOffset: `${offset}px`,
      boxShadow: `0 0 0 ${width + offset + 2}px rgba(0, 95, 204, 0.2)`,
    },
  };

  return (
    <div 
      className="focus-indicator-container"
      style={{
        "--focus-outline": focusStyles[variant].outline,
        "--focus-outline-offset": focusStyles[variant].outlineOffset,
        "--focus-box-shadow": focusStyles[variant].boxShadow,
      } as React.CSSProperties}
    >
      {children}
      
      <style jsx>{`
        .focus-indicator-container *:focus {
          outline: var(--focus-outline) !important;
          outline-offset: var(--focus-outline-offset) !important;
          box-shadow: var(--focus-box-shadow) !important;
        }
      `}</style>
    </div>
  );
};

// Text Sizing Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  baseSize?: "sm" | "base" | "lg" | "xl";
  scalable?: boolean;
  lineHeight?: "tight" | "normal" | "relaxed";
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  baseSize = "base",
  scalable = true,
  lineHeight = "normal",
  className = "",
}) => {
  const [textSize, setTextSize] = useState(1);
  
  const baseSizes = {
    sm: "0.875rem",
    base: "1rem", 
    lg: "1.125rem",
    xl: "1.25rem",
  };
  
  const lineHeights = {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  };

  const increaseText = () => setTextSize(prev => Math.min(prev + 0.25, 2));
  const decreaseText = () => setTextSize(prev => Math.max(prev - 0.25, 0.75));
  const resetText = () => setTextSize(1);

  return (
    <div className={`responsive-text ${className}`}>
      {scalable && (
        <div className="text-controls mb-4 flex items-center space-x-2">
          <span className="text-sm text-gray-600">Text Size:</span>
          <button
            onClick={decreaseText}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            aria-label="Decrease text size"
          >
            A-
          </button>
          <button
            onClick={resetText}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            aria-label="Reset text size"
          >
            A
          </button>
          <button
            onClick={increaseText}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            aria-label="Increase text size"
          >
            A+
          </button>
          <span className="text-xs text-gray-500">({Math.round(textSize * 100)}%)</span>
        </div>
      )}
      
      <div
        style={{
          fontSize: `calc(${baseSizes[baseSize]} * ${textSize})`,
          lineHeight: lineHeights[lineHeight],
        }}
      >
        {children}
      </div>
    </div>
  );
};

// High Contrast Mode Toggle
export const HighContrastToggle: React.FC<{ onToggle?: (enabled: boolean) => void }> = ({ onToggle }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
      setEnabled(prefersHighContrast);
    }
  }, []);

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (onToggle) onToggle(newState);
    
    // Apply high contrast styles to document
    if (newState) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  return (
    <button
      onClick={toggle}
      className={`
        inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
        ${enabled 
          ? "bg-black text-white border-2 border-white focus:ring-white" 
          : "bg-white text-black border-2 border-black focus:ring-black"
        }
      `}
      aria-pressed={enabled}
      aria-label={`High contrast mode ${enabled ? "enabled" : "disabled"}`}
    >
      <span className="mr-2">🎨</span>
      High Contrast {enabled ? "On" : "Off"}
    </button>
  );
};

export default VisualAccessibility;
