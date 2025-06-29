// Semantic Layout Component for WCAG 2.1 AA Compliance
// Task 4.6.2: Accessibility Compliance - Sub-task 1: Semantic HTML Structure

import React from "react";
import { SEMANTIC_ELEMENT_MAP } from "../../config/accessibility";

interface SemanticLayoutProps {
  children: React.ReactNode;
  skipLinks?: boolean;
  landmarks?: boolean;
  className?: string;
}

export const SemanticLayout: React.FC<SemanticLayoutProps> = ({
  children,
  skipLinks = true,
  landmarks = true,
  className = "",
}) => {
  return (
    <div className={`semantic-layout ${className}`}>
      {/* Skip Links */}
      {skipLinks && (
        <div className="skip-links">
          <a
            href="#main-content"
            className="skip-link absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden focus:static focus:w-auto focus:h-auto focus:p-3 focus:bg-blue-600 focus:text-white focus:z-50 focus:rounded"
          >
            Skip to main content
          </a>
          <a
            href="#main-navigation"
            className="skip-link absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden focus:static focus:w-auto focus:h-auto focus:p-3 focus:bg-blue-600 focus:text-white focus:z-50 focus:rounded"
          >
            Skip to navigation
          </a>
        </div>
      )}

      {/* Semantic Structure */}
      <div className="min-h-screen flex flex-col">
        {/* Header with proper semantic structure */}
        <header
          role={landmarks ? SEMANTIC_ELEMENT_MAP.header.role : undefined}
          aria-label={landmarks ? SEMANTIC_ELEMENT_MAP.header.ariaLabel : undefined}
          className="bg-white shadow-sm border-b"
          id="page-header"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav
              role={landmarks ? SEMANTIC_ELEMENT_MAP.navigation.role : undefined}
              aria-label={landmarks ? SEMANTIC_ELEMENT_MAP.navigation.ariaLabel : undefined}
              id="main-navigation"
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">
                  PFM Community Portal
                </h1>
              </div>
              
              <div className="flex items-center space-x-4" role="menubar">
                <a
                  href="/"
                  className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-3 py-2"
                  role="menuitem"
                >
                  Home
                </a>
                <a
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-3 py-2"
                  role="menuitem"
                >
                  Dashboard
                </a>
                <a
                  href="/communities"
                  className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-3 py-2"
                  role="menuitem"
                >
                  Communities
                </a>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          role={landmarks ? SEMANTIC_ELEMENT_MAP.main.role : undefined}
          aria-label={landmarks ? SEMANTIC_ELEMENT_MAP.main.ariaLabel : undefined}
          id="main-content"
          className="flex-1 bg-gray-50"
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          role={landmarks ? SEMANTIC_ELEMENT_MAP.footer.role : undefined}
          aria-label={landmarks ? SEMANTIC_ELEMENT_MAP.footer.ariaLabel : undefined}
          id="main-footer"
          className="bg-white border-t mt-auto"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-600">
                © 2024 PFM Community Portal. All rights reserved.
              </div>
              <nav aria-label="Footer navigation" className="flex space-x-6">
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                >
                  Terms of Service
                </a>
                <a
                  href="/accessibility"
                  className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                >
                  Accessibility
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </div>

      {/* Live Region for Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        id="live-region"
        className="sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden"
      />
      
      <div
        aria-live="assertive"
        aria-atomic="true"
        id="live-region-assertive"
        className="sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden"
      />
    </div>
  );
};

export default SemanticLayout;
