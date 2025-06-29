// Screen Reader Support Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 3: Screen Reader Support

import React, { useEffect, useRef, useState } from "react";
import { announceToScreenReader } from "../../utils/accessibility";

interface ScreenReaderSupportProps {
  children: React.ReactNode;
  announcePageChanges?: boolean;
  announceStatusUpdates?: boolean;
  liveRegionPoliteness?: "off" | "polite" | "assertive";
  className?: string;
}

export const ScreenReaderSupport: React.FC<ScreenReaderSupportProps> = ({
  children,
  announcePageChanges = true,
  announceStatusUpdates = true,
  liveRegionPoliteness = "polite",
  className = "",
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const lastAnnouncementRef = useRef<string>("");

  // Announce page changes
  useEffect(() => {
    if (announcePageChanges && typeof document !== "undefined") {
      const pageTitle = document.title;
      if (pageTitle) {
        announceToScreenReader(`Page loaded: ${pageTitle}`, "polite");
        setAnnouncements(prev => [...prev.slice(-4), `Page: ${pageTitle}`]);
      }
    }
  }, [announcePageChanges]);

  // Create announcement function for child components
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (message !== lastAnnouncementRef.current) {
      announceToScreenReader(message, priority);
      setAnnouncements(prev => [...prev.slice(-4), message]);
      lastAnnouncementRef.current = message;
    }
  };

  return (
    <div className={`screen-reader-support ${className}`}>
      {/* Live regions for announcements */}
      <div
        id="sr-live-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden"
      />
      <div
        id="sr-live-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden"
      />
      
      {/* Status region for dynamic updates */}
      <div
        id="sr-status"
        role="status"
        aria-live={liveRegionPoliteness}
        aria-atomic="true"
        className="sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden"
      />

      {/* Main content with screen reader context */}
      <div data-screen-reader-support="true">
        {React.cloneElement(children as React.ReactElement, { announce })}
      </div>

      {/* Recent announcements (for debugging/demo) */}
      {announcements.length > 0 && (
        <div className="sr-announcements-log hidden" aria-hidden="true">
          {announcements.map((announcement, index) => (
            <div key={index}>{announcement}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// HOC for adding screen reader support to any component
export const withScreenReaderSupport = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    announceOnMount?: string;
    announceOnUnmount?: string;
    announceOnUpdate?: (prevProps: P, nextProps: P) => string | null;
  } = {}
) => {
  return React.forwardRef<any, P & { announce?: (message: string, priority?: "polite" | "assertive") => void }>((props, ref) => {
    const { announce, ...componentProps } = props;

    useEffect(() => {
      if (options.announceOnMount && announce) {
        announce(options.announceOnMount);
      }

      return () => {
        if (options.announceOnUnmount && announce) {
          announce(options.announceOnUnmount);
        }
      };
    }, [announce]);

    return <Component ref={ref} {...(componentProps as P)} />;
  });
};

// Accessible Image Component with proper alt text
interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  decorative?: boolean;
  description?: string;
  caption?: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  decorative = false,
  description,
  caption,
  className = "",
  ...props
}) => {
  const imageId = `img-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${imageId}-desc` : undefined;

  return (
    <figure className={className}>
      <img
        id={imageId}
        alt={decorative ? "" : alt}
        aria-hidden={decorative}
        aria-describedby={descriptionId}
        className="max-w-full h-auto"
        {...props}
      />
      {description && (
        <div id={descriptionId} className="sr-only">
          {description}
        </div>
      )}
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Accessible Form Component with proper labeling
interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  title?: string;
  description?: string;
  announce?: (message: string, priority?: "polite" | "assertive") => void;
  className?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  title,
  description,
  announce,
  className = "",
}) => {
  const formId = `form-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = title ? `${formId}-title` : undefined;
  const descId = description ? `${formId}-desc` : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    if (onSubmit) {
      onSubmit(e);
      if (announce) {
        announce("Form submitted", "assertive");
      }
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      role="form"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={className}
    >
      {title && (
        <h2 id={titleId} className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h2>
      )}
      {description && (
        <p id={descId} className="text-sm text-gray-600 mb-4">
          {description}
        </p>
      )}
      {children}
    </form>
  );
};

// Accessible Input Component with proper labeling
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  announce?: (message: string, priority?: "polite" | "assertive") => void;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  hint,
  required = false,
  announce,
  className = "",
  onChange,
  ...props
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    
    // Announce validation errors
    if (error && announce) {
      announce(`Error: ${error}`, "assertive");
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 mb-1">
          {hint}
        </p>
      )}
      
      <input
        id={inputId}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
        className={`
          w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-300 bg-red-50" : "border-gray-300"}
          ${className}
        `}
        onChange={handleChange}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Status/Alert Component for screen reader announcements
interface AccessibleAlertProps {
  children: React.ReactNode;
  type?: "info" | "success" | "warning" | "error";
  announce?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  children,
  type = "info",
  announce = true,
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (announce && visible) {
      const messageText = typeof children === "string" ? children : "Alert message";
      announceToScreenReader(`${type}: ${messageText}`, type === "error" ? "assertive" : "polite");
    }
  }, [children, type, announce, visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
    announceToScreenReader("Alert dismissed", "polite");
  };

  if (!visible) return null;

  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`
        p-4 border rounded-lg flex items-start justify-between
        ${typeStyles[type]}
        ${className}
      `}
    >
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="Dismiss alert"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default ScreenReaderSupport;
