// User Workflow Integration Tests
// Task 4.7.2: Frontend Integration Tests - User workflow testing

import React from "react";
import { render, screen, fireEvent, waitFor } from "../test-utils";
import AccessibleButton from "../../components/Accessible/AccessibleButton";

describe("User Workflow Integration Tests", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  describe("Multi-Step User Workflows", () => {
    it("handles complete user interaction workflow", async () => {
      const WorkflowComponent = () => {
        const [step, setStep] = React.useState(1);
        const [data, setData] = React.useState("");

        return (
          <div>
            {step === 1 && (
              <div data-testid="step-1">
                <h2>Step 1: Enter Data</h2>
                <input
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder="Enter some data"
                />
                <AccessibleButton
                  onClick={() => setStep(2)}
                  disabled={!data}
                >
                  Next Step
                </AccessibleButton>
              </div>
            )}
            
            {step === 2 && (
              <div data-testid="step-2">
                <h2>Step 2: Confirm</h2>
                <p>Data: {data}</p>
                <AccessibleButton onClick={() => setStep(1)}>
                  Back
                </AccessibleButton>
                <AccessibleButton
                  variant="primary"
                  onClick={() => setStep(3)}
                >
                  Confirm
                </AccessibleButton>
              </div>
            )}
            
            {step === 3 && (
              <div data-testid="step-3">
                <h2>Complete!</h2>
                <p>Workflow completed successfully</p>
              </div>
            )}
          </div>
        );
      };

      render(<WorkflowComponent />);

      // Step 1: Enter data
      expect(screen.getByTestId("step-1")).toBeInTheDocument();
      const input = screen.getByPlaceholderText("Enter some data");
      const nextButton = screen.getByText("Next Step");

      // Button should be disabled initially
      expect(nextButton).toBeDisabled();

      // Enter data
      fireEvent.change(input, { target: { value: "test data" } });
      expect(nextButton).toBeEnabled();

      // Move to step 2
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
      });

      // Step 2: Confirm data
      expect(screen.getByText("Data: test data")).toBeInTheDocument();
      
      // Move to step 3
      const confirmButton = screen.getByText("Confirm");
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
      });
      
      expect(screen.getByText("Workflow completed successfully")).toBeInTheDocument();
    });

    it("handles error recovery workflows", async () => {
      const ErrorRecoveryComponent = () => {
        const [hasError, setHasError] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleAction = async () => {
          setIsLoading(true);
          setHasError(false);
          
          // Simulate API call
          setTimeout(() => {
            setIsLoading(false);
            setHasError(true); // Simulate error
          }, 100);
        };

        const handleRetry = () => {
          setHasError(false);
        };

        return (
          <div>
            {!hasError && !isLoading && (
              <AccessibleButton onClick={handleAction}>
                Perform Action
              </AccessibleButton>
            )}
            
            {isLoading && (
              <AccessibleButton isLoading loadingText="Processing...">
                Perform Action
              </AccessibleButton>
            )}
            
            {hasError && (
              <div data-testid="error-state">
                <p>Something went wrong!</p>
                <AccessibleButton onClick={handleRetry}>
                  Try Again
                </AccessibleButton>
              </div>
            )}
          </div>
        );
      };

      render(<ErrorRecoveryComponent />);

      // Initial state
      const actionButton = screen.getByText("Perform Action");
      fireEvent.click(actionButton);

      // Loading state
      await waitFor(() => {
        expect(screen.getByText("Processing...")).toBeInTheDocument();
      });

      // Error state
      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      }, { timeout: 200 });

      // Recovery
      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);
      
      expect(screen.getByText("Perform Action")).toBeInTheDocument();
    });
  });

  describe("Form Submission Workflows", () => {
    it("handles complete form submission workflow", async () => {
      const FormComponent = () => {
        const [formData, setFormData] = React.useState({ name: "", email: "" });
        const [isSubmitted, setIsSubmitted] = React.useState(false);
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const newErrors: Record<string, string> = {};
          
          if (!formData.name) newErrors.name = "Name is required";
          if (!formData.email) newErrors.email = "Email is required";
          
          setErrors(newErrors);
          
          if (Object.keys(newErrors).length === 0) {
            setIsSubmitted(true);
          }
        };

        return (
          <div>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  {errors.name && <span data-testid="name-error">{errors.name}</span>}
                </div>
                
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {errors.email && <span data-testid="email-error">{errors.email}</span>}
                </div>
                
                <AccessibleButton type="submit">
                  Submit Form
                </AccessibleButton>
              </form>
            ) : (
              <div data-testid="success-message">
                <h2>Form Submitted Successfully!</h2>
                <p>Thank you, {formData.name}!</p>
              </div>
            )}
          </div>
        );
      };

      render(<FormComponent />);

      // Try to submit empty form
      const submitButton = screen.getByText("Submit Form");
      fireEvent.click(submitButton);

      // Check validation errors
      await waitFor(() => {
        expect(screen.getByTestId("name-error")).toBeInTheDocument();
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });

      // Fill form correctly
      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      // Submit valid form
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });
      
      expect(screen.getByText("Thank you, John Doe!")).toBeInTheDocument();
    });
  });

  describe("Navigation Workflows", () => {
    it("handles navigation between different views", () => {
      const NavigationComponent = () => {
        const [currentView, setCurrentView] = React.useState("home");

        return (
          <div>
            <nav>
              <AccessibleButton onClick={() => setCurrentView("home")}>
                Home
              </AccessibleButton>
              <AccessibleButton onClick={() => setCurrentView("about")}>
                About
              </AccessibleButton>
              <AccessibleButton onClick={() => setCurrentView("contact")}>
                Contact
              </AccessibleButton>
            </nav>
            
            <main>
              {currentView === "home" && (
                <div data-testid="home-view">
                  <h1>Home Page</h1>
                  <p>Welcome to the home page</p>
                </div>
              )}
              
              {currentView === "about" && (
                <div data-testid="about-view">
                  <h1>About Page</h1>
                  <p>Learn more about us</p>
                </div>
              )}
              
              {currentView === "contact" && (
                <div data-testid="contact-view">
                  <h1>Contact Page</h1>
                  <p>Get in touch with us</p>
                </div>
              )}
            </main>
          </div>
        );
      };

      render(<NavigationComponent />);

      // Initial view
      expect(screen.getByTestId("home-view")).toBeInTheDocument();

      // Navigate to About
      fireEvent.click(screen.getByText("About"));
      expect(screen.getByTestId("about-view")).toBeInTheDocument();
      expect(screen.queryByTestId("home-view")).not.toBeInTheDocument();

      // Navigate to Contact
      fireEvent.click(screen.getByText("Contact"));
      expect(screen.getByTestId("contact-view")).toBeInTheDocument();
      expect(screen.queryByTestId("about-view")).not.toBeInTheDocument();

      // Navigate back to Home
      fireEvent.click(screen.getByText("Home"));
      expect(screen.getByTestId("home-view")).toBeInTheDocument();
      expect(screen.queryByTestId("contact-view")).not.toBeInTheDocument();
    });
  });
});
