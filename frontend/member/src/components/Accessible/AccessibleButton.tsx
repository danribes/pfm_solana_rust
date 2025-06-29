// Accessible Button Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Touch and keyboard accessible button

import React, { forwardRef } from "react";

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      isLoading = false,
      loadingText,
      children,
      ariaLabel,
      ariaDescribedBy,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      "inline-flex items-center justify-center font-medium rounded-md",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "transition-colors duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ];

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    };

    const sizeClasses = {
      small: "min-h-[44px] px-3 py-2 text-sm min-w-[44px]", // WCAG 2.1 AA minimum
      medium: "min-h-[48px] px-4 py-2 text-base min-w-[48px]", // Recommended size
      large: "min-h-[56px] px-6 py-3 text-lg min-w-[56px]", // Large touch target
    };

    const classes = [
      ...baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText || "Loading..."}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export default AccessibleButton;
