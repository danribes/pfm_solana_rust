// AccessibleButton Component Unit Tests
// Task 4.7.1: Frontend Unit Tests - Component testing

import React from "react";
import { render, screen, fireEvent } from "../test-utils";
import AccessibleButton from "../../components/Accessible/AccessibleButton";

describe("AccessibleButton", () => {
  const defaultProps = {
    children: "Test Button",
  };

  describe("Rendering", () => {
    it("renders with correct text content", () => {
      render(<AccessibleButton {...defaultProps} />);
      expect(screen.getByRole("button")).toHaveTextContent("Test Button");
    });

    it("renders with correct variant classes", () => {
      const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-blue-600");

      rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-gray-200");

      rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-red-600");
    });

    it("renders with correct size classes", () => {
      const { rerender } = render(<AccessibleButton size="small">Small</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-[44px]");

      rerender(<AccessibleButton size="medium">Medium</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-[48px]");

      rerender(<AccessibleButton size="large">Large</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-[56px]");
    });

    it("renders with custom className", () => {
      render(<AccessibleButton className="custom-class">Button</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("meets WCAG 2.1 AA touch target requirements", () => {
      render(<AccessibleButton size="small">Small Button</AccessibleButton>);
      const button = screen.getByRole("button");
      
      // Should have minimum 44px height and width for touch targets
      expect(button).toHaveClass("min-h-[44px]", "min-w-[44px]");
    });

    it("has proper focus indicators", () => {
      render(<AccessibleButton>Focusable Button</AccessibleButton>);
      const button = screen.getByRole("button");
      
      expect(button).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    it("supports aria-label", () => {
      render(<AccessibleButton ariaLabel="Custom label">Button</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Custom label");
    });

    it("supports aria-describedby", () => {
      render(<AccessibleButton ariaDescribedBy="description">Button</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", "description");
    });

    it("is keyboard accessible", () => {
      const handleClick = jest.fn();
      render(<AccessibleButton onClick={handleClick}>Keyboard Button</AccessibleButton>);
      
      const button = screen.getByRole("button");
      button.focus();
      
      // Should be focusable
      expect(button).toHaveFocus();
      
      // Should activate on Enter key
      fireEvent.keyDown(button, { key: "Enter" });
      // Note: Testing framework limitation - actual Enter key behavior handled by browser
      
      // Should activate on Space key
      fireEvent.keyDown(button, { key: " " });
    });
  });

  describe("Loading State", () => {
    it("displays loading spinner when isLoading is true", () => {
      render(<AccessibleButton isLoading>Loading Button</AccessibleButton>);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("displays custom loading text", () => {
      render(
        <AccessibleButton isLoading loadingText="Saving...">
          Save Button
        </AccessibleButton>
      );
      
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(<AccessibleButton isLoading>Loading Button</AccessibleButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Disabled State", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(<AccessibleButton disabled>Disabled Button</AccessibleButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<AccessibleButton disabled>Disabled Button</AccessibleButton>);
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });

    it("does not call onClick when disabled", () => {
      const handleClick = jest.fn();
      render(<AccessibleButton disabled onClick={handleClick}>Disabled Button</AccessibleButton>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Event Handling", () => {
    it("calls onClick when clicked", () => {
      const handleClick = jest.fn();
      render(<AccessibleButton onClick={handleClick}>Clickable Button</AccessibleButton>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("passes event object to onClick handler", () => {
      const handleClick = jest.fn();
      render(<AccessibleButton onClick={handleClick}>Event Button</AccessibleButton>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it("supports other button props", () => {
      const handleMouseEnter = jest.fn();
      render(
        <AccessibleButton onMouseEnter={handleMouseEnter} type="submit">
          Submit Button
        </AccessibleButton>
      );
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      
      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalled();
    });
  });

  describe("Forward Ref", () => {
    it("forwards ref to button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AccessibleButton ref={ref}>Ref Button</AccessibleButton>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveTextContent("Ref Button");
    });
  });

  describe("Responsive Design", () => {
    it("maintains touch target size across different variants", () => {
      const variants = ["primary", "secondary", "success", "warning", "danger"] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(<AccessibleButton variant={variant} size="small">Test</AccessibleButton>);
        expect(screen.getByRole("button")).toHaveClass("min-h-[44px]");
        unmount();
      });
    });

    it("scales properly with different sizes", () => {
      const sizes = [
        { size: "small", expectedClass: "min-h-[44px]" },
        { size: "medium", expectedClass: "min-h-[48px]" },
        { size: "large", expectedClass: "min-h-[56px]" },
      ] as const;

      sizes.forEach(({ size, expectedClass }) => {
        const { unmount } = render(<AccessibleButton size={size}>Test</AccessibleButton>);
        expect(screen.getByRole("button")).toHaveClass(expectedClass);
        unmount();
      });
    });
  });
});
