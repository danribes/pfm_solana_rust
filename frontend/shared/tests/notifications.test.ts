// Notification System Tests
// Task 5.2.2: Real-Time Notification System

import {
  createNotification,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  sortNotifications,
  filterNotifications,
  groupNotificationsByCategory,
  shouldSendNotification,
  getDefaultNotificationPreferences,
} from "../utils/notifications";
import { BaseNotification, NotificationPreferences } from "../types/notifications";

describe("Notification Utilities", () => {
  const mockUserId = "test-user-123";

  describe("createNotification", () => {
    it("should create a notification with required fields", () => {
      const notification = createNotification(
        mockUserId,
        "vote",
        "voting",
        "New Vote",
        "A new vote has started"
      );

      expect(notification.userId).toBe(mockUserId);
      expect(notification.type).toBe("vote");
      expect(notification.category).toBe("voting");
      expect(notification.title).toBe("New Vote");
      expect(notification.message).toBe("A new vote has started");
      expect(notification.read).toBe(false);
      expect(notification.priority).toBe("medium");
      expect(notification.id).toBeTruthy();
      expect(notification.createdAt).toBeTruthy();
    });

    it("should accept optional fields", () => {
      const notification = createNotification(
        mockUserId,
        "announcement",
        "system",
        "System Update",
        "System maintenance scheduled",
        {
          priority: "high",
          actionUrl: "/maintenance",
          data: { maintenanceId: "123" },
        }
      );

      expect(notification.priority).toBe("high");
      expect(notification.actionUrl).toBe("/maintenance");
      expect(notification.data).toEqual({ maintenanceId: "123" });
    });
  });

  describe("formatNotificationTime", () => {
    const now = Date.now();

    it("should format recent time as 'Just now'", () => {
      const recent = now - 30000; // 30 seconds ago
      expect(formatNotificationTime(recent)).toBe("Just now");
    });

    it("should format minutes correctly", () => {
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      expect(formatNotificationTime(fiveMinutesAgo)).toBe("5m ago");
    });

    it("should format hours correctly", () => {
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;
      expect(formatNotificationTime(twoHoursAgo)).toBe("2h ago");
    });

    it("should format days correctly", () => {
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      expect(formatNotificationTime(threeDaysAgo)).toBe("3d ago");
    });
  });

  describe("getNotificationIcon", () => {
    it("should return correct icons for notification types", () => {
      expect(getNotificationIcon("vote", "voting")).toBe("🗳️");
      expect(getNotificationIcon("member_joined", "community")).toBe("👋");
      expect(getNotificationIcon("security", "security")).toBe("🔒");
    });

    it("should fallback to category icon", () => {
      expect(getNotificationIcon("unknown" as any, "voting")).toBe("🗳️");
      expect(getNotificationIcon("unknown" as any, "community")).toBe("👥");
    });
  });

  describe("getNotificationColor", () => {
    it("should return correct colors for priorities", () => {
      expect(getNotificationColor("critical", "voting")).toBe("#ef4444");
      expect(getNotificationColor("high", "voting")).toBe("#f97316");
    });

    it("should return category colors for medium/low priority", () => {
      expect(getNotificationColor("medium", "voting")).toBe("#3b82f6");
      expect(getNotificationColor("low", "community")).toBe("#10b981");
    });
  });

  describe("sortNotifications", () => {
    it("should sort by priority then by date", () => {
      const notifications: BaseNotification[] = [
        createNotification(mockUserId, "vote", "voting", "Vote 1", "Message 1", { 
          priority: "medium", 
          createdAt: 1000 
        }),
        createNotification(mockUserId, "security", "security", "Security Alert", "Message 2", { 
          priority: "critical", 
          createdAt: 2000 
        }),
        createNotification(mockUserId, "announcement", "system", "Announcement", "Message 3", { 
          priority: "high", 
          createdAt: 3000 
        }),
      ];

      const sorted = sortNotifications(notifications);
      
      expect(sorted[0].priority).toBe("critical");
      expect(sorted[1].priority).toBe("high");
      expect(sorted[2].priority).toBe("medium");
    });
  });

  describe("filterNotifications", () => {
    const notifications: BaseNotification[] = [
      createNotification(mockUserId, "vote", "voting", "Vote 1", "Vote message", { read: false }),
      createNotification(mockUserId, "member_joined", "community", "New Member", "Member joined", { read: true }),
      createNotification(mockUserId, "announcement", "system", "System Alert", "System message", { read: false }),
    ];

    it("should filter by category", () => {
      const filtered = filterNotifications(notifications, { category: "voting" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe("voting");
    });

    it("should filter by unread status", () => {
      const filtered = filterNotifications(notifications, { unreadOnly: true });
      expect(filtered).toHaveLength(2);
      expect(filtered.every(n => !n.read)).toBe(true);
    });

    it("should filter by search term", () => {
      const filtered = filterNotifications(notifications, { search: "vote" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title.toLowerCase()).toContain("vote");
    });
  });

  describe("groupNotificationsByCategory", () => {
    it("should group notifications correctly", () => {
      const notifications: BaseNotification[] = [
        createNotification(mockUserId, "vote", "voting", "Vote 1", "Message 1"),
        createNotification(mockUserId, "vote", "voting", "Vote 2", "Message 2"),
        createNotification(mockUserId, "member_joined", "community", "Member", "Message 3"),
      ];

      const grouped = groupNotificationsByCategory(notifications);
      
      expect(grouped.voting).toHaveLength(2);
      expect(grouped.community).toHaveLength(1);
      expect(grouped.system).toHaveLength(0);
    });
  });

  describe("shouldSendNotification", () => {
    const preferences: NotificationPreferences = getDefaultNotificationPreferences(mockUserId);
    
    it("should allow sending when preferences are enabled", () => {
      const notification = createNotification(
        mockUserId,
        "vote",
        "voting",
        "Vote",
        "Message"
      );
      
      const shouldSend = shouldSendNotification(notification, preferences, "in-app");
      expect(shouldSend).toBe(true);
    });

    it("should block sending when do not disturb is enabled for non-critical", () => {
      const dndPreferences = {
        ...preferences,
        doNotDisturb: true,
      };
      
      const notification = createNotification(
        mockUserId,
        "vote",
        "voting",
        "Vote",
        "Message",
        { priority: "medium" }
      );
      
      const shouldSend = shouldSendNotification(notification, dndPreferences, "in-app");
      expect(shouldSend).toBe(false);
    });

    it("should allow critical notifications even with do not disturb", () => {
      const dndPreferences = {
        ...preferences,
        doNotDisturb: true,
      };
      
      const notification = createNotification(
        mockUserId,
        "security",
        "security",
        "Security Alert",
        "Critical security issue",
        { priority: "critical" }
      );
      
      const shouldSend = shouldSendNotification(notification, dndPreferences, "in-app");
      expect(shouldSend).toBe(true);
    });
  });

  describe("getDefaultNotificationPreferences", () => {
    it("should create default preferences with sensible defaults", () => {
      const preferences = getDefaultNotificationPreferences(mockUserId);
      
      expect(preferences.userId).toBe(mockUserId);
      expect(preferences.channels["in-app"].enabled).toBe(true);
      expect(preferences.channels["email"].enabled).toBe(true);
      expect(preferences.channels["push"].enabled).toBe(false);
      expect(preferences.categories.voting.enabled).toBe(true);
      expect(preferences.categories.security.priority).toBe("critical");
      expect(preferences.doNotDisturb).toBe(false);
    });
  });
}); 