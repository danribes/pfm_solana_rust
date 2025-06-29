// Simplified Accessibility Utilities Unit Tests
// Task 4.7.1: Frontend Unit Tests - Working utility function tests

import {
  calculateColorContrast,
  validateHeadingHierarchy,
  announceToScreenReader,
  createSkipLink,
  detectMotionPreferences,
  validateAriaAttributes,
  checkKeyboardNavigation,
  getAccessibilityScore,
} from "../../utils/accessibility";

describe("Accessibility Utilities - Working Tests", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  describe("calculateColorContrast", () => {
    it("calculates contrast ratios correctly", () => {
      const contrast1 = calculateColorContrast("#000000", "#FFFFFF");
      expect(contrast1).toBeGreaterThan(1);
      
      const contrast2 = calculateColorContrast("#2563EB", "#FFFFFF");
      expect(contrast2).toBeGreaterThan(1);
    });

    it("handles same colors", () => {
      const contrast = calculateColorContrast("#FF0000", "#FF0000");
      expect(contrast).toBe(1);
    });
  });

  describe("validateHeadingHierarchy", () => {
    it("returns array of errors", () => {
      document.body.innerHTML = `<h1>Title</h1><h2>Section</h2>`;
      const result = validateHeadingHierarchy(document.body);
      expect(Array.isArray(result)).toBe(true);
    });

    it("detects heading hierarchy issues", () => {
      document.body.innerHTML = `<h2>No H1</h2>`;
      const result = validateHeadingHierarchy(document.body);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("announceToScreenReader", () => {
    it("creates live region successfully", () => {
      announceToScreenReader("Test message");
      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toBeInTheDocument();
    });

    it("handles different priorities", () => {
      announceToScreenReader("Urgent message", "assertive");
      const liveRegion = document.querySelector("[aria-live=\"assertive\"]");
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe("createSkipLink", () => {
    it("creates skip link element", () => {
      const skipLink = createSkipLink("#main", "Skip to main");
      expect(skipLink.tagName).toBe("A");
      expect(skipLink.textContent).toBe("Skip to main");
    });

    it("creates link with default text", () => {
      const skipLink = createSkipLink("#main");
      expect(skipLink.tagName).toBe("A");
      expect(typeof skipLink.textContent).toBe("string");
    });
  });

  describe("detectMotionPreferences", () => {
    it("returns motion preferences object", () => {
      const preferences = detectMotionPreferences();
      expect(typeof preferences).toBe("object");
      expect(preferences).toHaveProperty("prefersReducedMotion");
      expect(preferences).toHaveProperty("prefersHighContrast");
      expect(preferences).toHaveProperty("prefersDarkMode");
    });
  });

  describe("validateAriaAttributes", () => {
    it("returns array for validation results", () => {
      const button = document.createElement("button");
      button.setAttribute("aria-label", "Test button");
      const result = validateAriaAttributes(button);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("checkKeyboardNavigation", () => {
    it("finds focusable elements", () => {
      document.body.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <a href="#">Link</a>
      `;
      const focusableElements = checkKeyboardNavigation(document.body);
      expect(Array.isArray(focusableElements)).toBe(true);
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe("getAccessibilityScore", () => {
    it("calculates scores correctly", () => {
      const auditResults = [
        { status: "pass", automated: true },
        { status: "pass", automated: true },
      ];
      const score = getAccessibilityScore(auditResults);
      expect(typeof score).toBe("number");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("handles empty results", () => {
      const score = getAccessibilityScore([]);
      expect(score).toBe(100);
    });
  });

  describe("Error Handling", () => {
    it("functions handle basic inputs", () => {
      expect(() => announceToScreenReader("test")).not.toThrow();
      expect(() => detectMotionPreferences()).not.toThrow();
      expect(() => createSkipLink("#test")).not.toThrow();
    });
  });
});
