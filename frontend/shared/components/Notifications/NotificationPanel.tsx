// Notification Panel Component
// Task 5.2.2: Real-Time Notification System

import React, { useState, useRef, useEffect } from "react";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { NotificationCategory } from "../../types/notifications";
import { formatNotificationTime, getNotificationIcon, getNotificationColor } from "../../utils/notifications";
import NotificationItem from "./NotificationItem";

interface NotificationPanelProps {
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showHeader?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className = "",
  maxHeight = "32rem",
  showSearch = true,
  showFilters = true,
  showHeader = true,
}) => {
  const {
    isNotificationPanelOpen,
    setNotificationPanelOpen,
    filteredNotifications,
    unreadCount,
    loading,
    error,
    hasMore,
    currentFilter,
    searchTerm,
    setFilter,
    setSearchTerm,
    clearFilters,
    markAllAsRead,
    loadMoreNotifications,
    refreshNotifications,
  } = useNotificationContext();

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle scroll to detect bottom for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsScrolledToBottom(isAtBottom);
    
    // Load more when near bottom
    if (isAtBottom && hasMore && !loading) {
      loadMoreNotifications();
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setNotificationPanelOpen(false);
      }
    };

    if (isNotificationPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotificationPanelOpen, setNotificationPanelOpen]);

  // Filter options
  const filterOptions: { value: NotificationCategory | "all"; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "📄" },
    { value: "voting", label: "Voting", icon: "🗳️" },
    { value: "community", label: "Community", icon: "👥" },
    { value: "system", label: "System", icon: "⚙️" },
    { value: "security", label: "Security", icon: "🔒" },
    { value: "personal", label: "Personal", icon: "👤" },
    { value: "admin", label: "Admin", icon: "🛡️" },
  ];

  if (!isNotificationPanelOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`
        fixed top-16 right-4 z-50
        w-96 bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-xl
        overflow-hidden
        ${className}
      `}
      style={{ maxHeight }}
    >
      {/* Header */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {/* Refresh button */}
              <button
                onClick={() => refreshNotifications()}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh notifications"
              >
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                  title="Mark all as read"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setNotificationPanelOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close notifications"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Filter tabs */}
          {showFilters && (
            <div className="flex flex-wrap gap-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${currentFilter === option.value
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
              {(currentFilter !== "all" || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Notification list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ maxHeight: "calc(100% - 8rem)" }}
      >
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-4xl mb-4">🔔</div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || currentFilter !== "all" ? "No matching notifications" : "No notifications"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {searchTerm || currentFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You're all caught up! New notifications will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => {}} // Handled by context
                onDelete={() => {}} // Handled by context
              />
            ))}
            
            {/* Loading more indicator */}
            {loading && hasMore && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading more notifications...</span>
                </div>
              </div>
            )}
            
            {/* Load more button */}
            {!loading && hasMore && isScrolledToBottom && (
              <div className="p-4 text-center">
                <button
                  onClick={() => loadMoreNotifications()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel; 