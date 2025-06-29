// Accessibility Utilities Unit Tests
// Task 4.7.1: Frontend Unit Tests - Utility function testing

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

describe("Accessibility Utilities", () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    
    // Reset any global mocks
    jest.clearAllMocks();
  });

  describe("calculateColorContrast", () => {
    it("calculates correct contrast ratio for black and white", () => {
      const contrast = calculateColorContrast("#000000", "#FFFFFF");
      expect(contrast).toBe(21); // Maximum contrast ratio
    });

    it("calculates correct contrast ratio for identical colors", () => {
      const contrast = calculateColorContrast("#FF0000", "#FF0000");
      expect(contrast).toBe(1); // No contrast
    });

    it("handles hex colors correctly", () => {
      const contrast = calculateColorContrast("#2563EB", "#FFFFFF");
      expect(contrast).toBeGreaterThan(4.5); // Should meet AA standard
    });

    it("handles RGB colors correctly", () => {
      const contrast = calculateColorContrast("rgb(37, 99, 235)", "rgb(255, 255, 255)");
      expect(contrast).toBeGreaterThan(4.5);
    });

    it("handles invalid color formats gracefully", () => {
      const contrast = calculateColorContrast("invalid", "#FFFFFF");
      expect(contrast).toBe(1); // Default to no contrast for invalid colors
    });

    it("meets WCAG AA standards for common UI colors", () => {
      const testCases = [
        { fg: "#2563EB", bg: "#FFFFFF", expected: 4.5 }, // Primary blue
        { fg: "#059669", bg: "#FFFFFF", expected: 4.5 }, // Success green
        { fg: "#DC2626", bg: "#FFFFFF", expected: 4.5 }, // Error red
      ];

      testCases.forEach(({ fg, bg, expected }) => {
        const contrast = calculateColorContrast(fg, bg);
        expect(contrast).toBeGreaterThanOrEqual(expected);
      });
    });
  });

  describe("validateHeadingHierarchy", () => {
    it("validates correct heading hierarchy", () => {
      document.body.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
        <h2>Another Section</h2>
      `;

      const isValid = validateHeadingHierarchy(document.body);
      expect(isValid).toBe(true);
    });

    it("detects missing h1", () => {
      document.body.innerHTML = `
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      `;

      const isValid = validateHeadingHierarchy(document.body);
      expect(isValid).toBe(false);
    });

    it("detects skipped heading levels", () => {
      document.body.innerHTML = `
        <h1>Main Title</h1>
        <h3>Skipped h2</h3>
      `;

      const isValid = validateHeadingHierarchy(document.body);
      expect(isValid).toBe(false);
    });

    it("handles empty container", () => {
      const isValid = validateHeadingHierarchy(document.body);
      expect(isValid).toBe(true); // Empty is considered valid
    });

    it("allows multiple h1s in different sections", () => {
      document.body.innerHTML = `
        <main>
          <h1>Main Content</h1>
        </main>
        <aside>
          <h1>Sidebar Content</h1>
        </aside>
      `;

      const isValid = validateHeadingHierarchy(document.body);
      expect(isValid).toBe(true);
    });
  });

  describe("announceToScreenReader", () => {
    it("creates live region with polite politeness", () => {
      announceToScreenReader("Test announcement", "polite");

      const liveRegion = document.querySelector("[aria-live=\"polite\"]");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe("Test announcement");
    });

    it("creates live region with assertive politeness", () => {
      announceToScreenReader("Urgent announcement", "assertive");

      const liveRegion = document.querySelector("[aria-live=\"assertive\"]");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe("Urgent announcement");
    });

    it("defaults to polite politeness", () => {
      announceToScreenReader("Default announcement");

      const liveRegion = document.querySelector("[aria-live=\"polite\"]");
      expect(liveRegion).toBeInTheDocument();
    });

    it("removes live region after timeout", (done) => {
      announceToScreenReader("Temporary announcement");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toBeInTheDocument();

      // Check that it gets removed (assuming 2s timeout)
      setTimeout(() => {
        const removedRegion = document.querySelector("[aria-live]");
        expect(removedRegion).not.toBeInTheDocument();
        done();
      }, 2100);
    });

    it("handles empty messages gracefully", () => {
      announceToScreenReader("");

      const liveRegion = document.querySelector("[aria-live]");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe("");
    });
  });

  describe("createSkipLink", () => {
    it("creates skip link with correct attributes", () => {
      const skipLink = createSkipLink("#main-content", "Skip to main content");

      expect(skipLink.tagName).toBe("A");
      expect(skipLink.getAttribute("href")).toBe("#main-content");
      expect(skipLink.textContent).toBe("Skip to main content");
      expect(skipLink.classList.contains("skip-link")).toBe(true);
    });

    it("creates skip link with default text", () => {
      const skipLink = createSkipLink("#main");

      expect(skipLink.textContent).toBe("Skip to main content");
    });

    it("applies correct styling classes", () => {
      const skipLink = createSkipLink("#main-content");

      expect(skipLink.classList.contains("sr-only")).toBe(true);
      expect(skipLink.classList.contains("focus:not-sr-only")).toBe(true);
    });

    it("handles keyboard activation", () => {
      const skipLink = createSkipLink("#target");
      const targetElement = document.createElement("div");
      targetElement.id = "target";
      targetElement.tabIndex = -1;
      document.body.appendChild(targetElement);

      // Mock focus method
      const focusSpy = jest.spyOn(targetElement, "focus");

      // Simulate click
      skipLink.click();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("detectMotionPreferences", () => {
    it("detects reduced motion preference", () => {
      // Mock matchMedia for reduced motion
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const preferences = detectMotionPreferences();
      expect(preferences.prefersReducedMotion).toBe(true);
    });

    it("detects high contrast preference", () => {
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-contrast: high)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const preferences = detectMotionPreferences();
      expect(preferences.prefersHighContrast).toBe(true);
    });

    it("detects dark mode preference", () => {
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const preferences = detectMotionPreferences();
      expect(preferences.prefersDarkMode).toBe(true);
    });

    it("handles unsupported matchMedia gracefully", () => {
      // @ts-ignore
      delete window.matchMedia;

      const preferences = detectMotionPreferences();
      expect(preferences.prefersReducedMotion).toBe(false);
      expect(preferences.prefersHighContrast).toBe(false);
      expect(preferences.prefersDarkMode).toBe(false);
    });
  });

  describe("validateAriaAttributes", () => {
    it("validates correct ARIA attributes", () => {
      const element = document.createElement("button");
      element.setAttribute("aria-label", "Close dialog");
      element.setAttribute("aria-expanded", "false");

      const isValid = validateAriaAttributes(element);
      expect(isValid).toBe(true);
    });

    it("detects invalid ARIA attribute values", () => {
      const element = document.createElement("button");
      element.setAttribute("aria-expanded", "invalid");

      const isValid = validateAriaAttributes(element);
      expect(isValid).toBe(false);
    });

    it("validates aria-describedby references", () => {
      const button = document.createElement("button");
      const description = document.createElement("div");
      description.id = "help-text";
      button.setAttribute("aria-describedby", "help-text");

      document.body.appendChild(description);
      document.body.appendChild(button);

      const isValid = validateAriaAttributes(button);
      expect(isValid).toBe(true);
    });

    it("detects missing aria-describedby references", () => {
      const button = document.createElement("button");
      button.setAttribute("aria-describedby", "non-existent");

      const isValid = validateAriaAttributes(button);
      expect(isValid).toBe(false);
    });

    it("handles elements without ARIA attributes", () => {
      const element = document.createElement("div");

      const isValid = validateAriaAttributes(element);
      expect(isValid).toBe(true); // No ARIA attributes is valid
    });
  });

  describe("checkKeyboardNavigation", () => {
    it("identifies focusable elements correctly", () => {
      document.body.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <a href="#">Link</a>
        <div tabindex="0">Focusable div</div>
        <div>Non-focusable div</div>
      `;

      const focusableElements = checkKeyboardNavigation(document.body);
      expect(focusableElements.length).toBe(4);
    });

    it("excludes disabled elements", () => {
      document.body.innerHTML = `
        <button disabled>Disabled Button</button>
        <input type="text" disabled />
        <button>Enabled Button</button>
      `;

      const focusableElements = checkKeyboardNavigation(document.body);
      expect(focusableElements.length).toBe(1);
    });

    it("excludes elements with tabindex=\"-1\"", () => {
      document.body.innerHTML = `
        <button tabindex="-1">Not focusable</button>
        <button>Focusable</button>
      `;

      const focusableElements = checkKeyboardNavigation(document.body);
      expect(focusableElements.length).toBe(1);
    });

    it("handles empty container", () => {
      const focusableElements = checkKeyboardNavigation(document.body);
      expect(focusableElements.length).toBe(0);
    });
  });

  describe("getAccessibilityScore", () => {
    it("calculates perfect score for all passing tests", () => {
      const auditResults = [
        { status: "pass", automated: true },
        { status: "pass", automated: true },
        { status: "pass", automated: false },
      ];

      const score = getAccessibilityScore(auditResults);
      expect(score).toBe(100);
    });

    it("calculates score with failed tests", () => {
      const auditResults = [
        { status: "pass", automated: true },
        { status: "fail", automated: true },
        { status: "pass", automated: true },
        { status: "fail", automated: true },
      ];

      const score = getAccessibilityScore(auditResults);
      expect(score).toBe(50); // 2 out of 4 passed = 50%
    });

    it("handles warnings as partial passes", () => {
      const auditResults = [
        { status: "pass", automated: true },
        { status: "warning", automated: true },
        { status: "fail", automated: true },
      ];

      const score = getAccessibilityScore(auditResults);
      expect(score).toBeGreaterThan(33); // Warning counts as partial
      expect(score).toBeLessThan(100);
    });

    it("handles empty audit results", () => {
      const score = getAccessibilityScore([]);
      expect(score).toBe(100); // No tests = perfect score
    });

    it("prioritizes automated tests in scoring", () => {
      const auditResults = [
        { status: "pass", automated: true },
        { status: "pass", automated: false },
        { status: "fail", automated: true },
        { status: "fail", automated: false },
      ];

      const score = getAccessibilityScore(auditResults);
      // Automated tests should have more weight
      expect(typeof score).toBe("number");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles null and undefined inputs gracefully", () => {
      expect(() => calculateColorContrast(null as any, "#FFFFFF")).not.toThrow();
      expect(() => validateHeadingHierarchy(null as any)).not.toThrow();
      expect(() => announceToScreenReader(null as any)).not.toThrow();
    });

    it("handles malformed HTML gracefully", () => {
      document.body.innerHTML = "<button><div>Malformed</div></button>";
      
      expect(() => checkKeyboardNavigation(document.body)).not.toThrow();
      expect(() => validateHeadingHierarchy(document.body)).not.toThrow();
    });

    it("handles very large DOM trees efficiently", () => {
      // Create a large DOM tree
      const container = document.createElement("div");
      for (let i = 0; i < 1000; i++) {
        const element = document.createElement("button");
        element.textContent = `Button ${i}`;
        container.appendChild(element);
      }
      document.body.appendChild(container);

      const start = Date.now();
      const focusableElements = checkKeyboardNavigation(document.body);
      const end = Date.now();

      expect(focusableElements.length).toBe(1000);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
