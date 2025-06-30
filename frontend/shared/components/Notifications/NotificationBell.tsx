// Notification Bell Component
// Task 5.2.2: Real-Time Notification System

import React from "react";
import { useNotificationContext } from "../../contexts/NotificationContext";

interface NotificationBellProps {
  className?: string;
  size?: "small" | "medium" | "large";
  showCount?: boolean;
  animate?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
  size = "medium",
  showCount = true,
  animate = true,
}) => {
  const { unreadCount, toggleNotificationPanel, loading } = useNotificationContext();

  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  const buttonSizeClasses = {
    small: "p-1",
    medium: "p-2",
    large: "p-3",
  };

  const countSizeClasses = {
    small: "text-xs min-w-4 h-4",
    medium: "text-xs min-w-5 h-5",
    large: "text-sm min-w-6 h-6",
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotificationPanel}
        disabled={loading}
        className={`
          relative rounded-full transition-colors duration-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonSizeClasses[size]}
          ${className}
        `}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <div className="relative">
          {/* Bell icon */}
          <svg
            className={`
              ${sizeClasses[size]}
              text-gray-600 dark:text-gray-300
              transition-all duration-200
              ${animate && unreadCount > 0 ? "animate-pulse" : ""}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </button>

      {/* Notification count badge */}
      {showCount && unreadCount > 0 && (
        <div
          className={`
            absolute -top-1 -right-1
            bg-red-500 text-white rounded-full
            flex items-center justify-center
            font-semibold
            animate-in fade-in zoom-in duration-200
            ${countSizeClasses[size]}
          `}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}

      {/* Pulse animation for new notifications */}
      {animate && unreadCount > 0 && (
        <div className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
      )}
    </div>
  );
};

export default NotificationBell; 