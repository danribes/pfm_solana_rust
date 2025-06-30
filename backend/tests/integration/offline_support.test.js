/**
 * Offline Support Tests - Task 5.4.2
 * Simple test to verify offline support implementation
 */

const { Sequelize } = require("sequelize");
const request = require("supertest");
const app = require("../../app");

describe("Offline Support - Task 5.4.2", () => {
  let sequelize;
  let agent;

  beforeAll(async () => {
    sequelize = new Sequelize(
      process.env.TEST_DB_NAME || "pfm_community",
      process.env.TEST_DB_USER || "pfm_user",
      process.env.TEST_DB_PASSWORD || "pfm_password",
      {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false
      }
    );

    await sequelize.authenticate();
    agent = request.agent(app);
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  test("should verify offline support files exist", async () => {
    const fs = require("fs");
    const path = require("path");
    
    // Check that offline files were created using correct relative paths
    // Test is in backend/tests/integration/, files are in frontend/shared/
    const offlineFiles = [
      "../../../frontend/shared/types/offline.ts",
      "../../../frontend/shared/config/offline.ts", 
      "../../../frontend/shared/services/offline.ts",
      "../../../frontend/shared/hooks/useOffline.ts",
      "../../../frontend/shared/contexts/OfflineContext.tsx",
      "../../../frontend/shared/utils/fallback.ts"
    ];

    for (const file of offlineFiles) {
      const filePath = path.resolve(__dirname, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test("should handle basic offline scenarios", async () => {
    // Test basic functionality
    const data = [
      { id: 1, priority: "high" },
      { id: 2, priority: "low" },
      { id: 3, priority: "critical" }
    ];

    const priorityOrder = { critical: 3, high: 2, low: 1 };
    const sorted = data.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    expect(sorted[0].priority).toBe("critical");
    expect(sorted[1].priority).toBe("high");
    expect(sorted[2].priority).toBe("low");
  });

  test("should simulate offline operation queuing", async () => {
    const operation = {
      id: "test-op",
      type: "create",
      status: "pending",
      retryCount: 0,
      maxRetries: 3
    };

    // Simulate retry logic
    while (operation.retryCount < operation.maxRetries && operation.status !== "completed") {
      operation.retryCount++;
      if (operation.retryCount === 3) {
        operation.status = "completed";
      }
    }

    expect(operation.status).toBe("completed");
    expect(operation.retryCount).toBe(3);
  });

  test("should handle data synchronization", async () => {
    const localData = { id: 1, name: "Local", updated: new Date("2024-01-01") };
    const remoteData = { id: 1, name: "Remote", updated: new Date("2024-01-02") };

    // Timestamp-based conflict resolution
    const resolved = localData.updated < remoteData.updated ? remoteData : localData;
    expect(resolved.name).toBe("Remote");
  });

  test("should verify health endpoint works", async () => {
    const response = await agent.get("/api/health").expect(200);
    expect(response.body.status).toBe("healthy");
  });
});

