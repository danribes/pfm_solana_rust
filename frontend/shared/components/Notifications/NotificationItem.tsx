// Notification Item Component
// Task 5.2.2: Real-Time Notification System

import React, { useState } from "react";
import { BaseNotification } from "../../types/notifications";
import { useNotificationContext } from "../../contexts/NotificationContext";
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  truncateMessage,
} from "../../utils/notifications";

interface NotificationItemProps {
  notification: BaseNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
  compact = false,
}) => {
  const { markAsRead, deleteNotification } = useNotificationContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkAsRead = async () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    } else {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        onDelete(notification.id);
      } else {
        await deleteNotification(notification.id);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead();
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith("http")) {
        window.open(notification.actionUrl, "_blank");
      } else {
        window.location.href = notification.actionUrl;
      }
    }
  };

  const priorityColor = getNotificationColor(notification.priority, notification.category);
  const icon = getNotificationIcon(notification.type, notification.category);

  return (
    <div
      className={`
        relative transition-all duration-200
        ${notification.read ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/20"}
        ${notification.actionUrl ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}
        ${compact ? "px-3 py-2" : "px-4 py-3"}
        ${isDeleting ? "opacity-50" : ""}
      `}
      onClick={notification.actionUrl ? handleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityColor }}
      />

      <div className="flex items-start space-x-3 ml-2">
        {/* Icon */}
        <div className={`flex-shrink-0 ${compact ? "mt-0.5" : "mt-1"}`}>
          <div
            className={`
              ${compact ? "w-6 h-6 text-base" : "w-8 h-8 text-lg"}
              rounded-full bg-gray-100 dark:bg-gray-700
              flex items-center justify-center
            `}
          >
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4
                className={`
                  ${compact ? "text-sm" : "text-base"}
                  font-medium text-gray-900 dark:text-white
                  ${!notification.read ? "font-semibold" : ""}
                `}
              >
                {notification.title}
              </h4>

              {/* Message */}
              <p
                className={`
                  ${compact ? "text-xs mt-0.5" : "text-sm mt-1"}
                  text-gray-600 dark:text-gray-300
                  ${!notification.read ? "text-gray-700 dark:text-gray-200" : ""}
                `}
              >
                {compact ? truncateMessage(notification.message, 60) : notification.message}
              </p>

              {/* Metadata */}
              <div className={`flex items-center space-x-2 ${compact ? "mt-1" : "mt-2"}`}>
                {/* Time */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNotificationTime(notification.createdAt)}
                </span>

                {/* Category badge */}
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}
                >
                  {notification.category}
                </span>

                {/* Priority indicator for high/critical */}
                {(notification.priority === "high" || notification.priority === "critical") && (
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${notification.priority === "critical"
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                      }
                    `}
                  >
                    {notification.priority === "critical" ? "🚨" : "⚠️"} {notification.priority}
                  </span>
                )}

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (isHovered || !notification.read) && (
              <div className="flex items-center space-x-1 ml-2">
                {/* Mark as read */}
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead();
                    }}
                    className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Mark as read"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete notification"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action button if actionUrl exists */}
          {notification.actionUrl && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                View Details
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default NotificationItem; 