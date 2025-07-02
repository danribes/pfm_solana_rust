import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinRequestForm from '../JoinRequestForm';

// Mock the router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock the auth context
const mockAuthState = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser',
  },
};

jest.mock('../../../shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    authState: mockAuthState,
  }),
}));

describe('JoinRequestForm', () => {
  const defaultProps = {
    communityId: 'test-community-123',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<JoinRequestForm {...defaultProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders form after loading community data', async () => {
    render(<JoinRequestForm {...defaultProps} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check if form elements are present
    expect(screen.getByText('Apply to Join Web3 Developers Community')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Web3 Experience Level/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Submit Application');
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Full Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email Address is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    
    render(<JoinRequestForm {...defaultProps} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Fill out the form
    await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
    await user.selectOptions(screen.getByLabelText(/Web3 Experience Level/), 'Intermediate');
    await user.type(
      screen.getByLabelText(/Why do you want to join/),
      'I am passionate about Web3 development and want to contribute to the community.'
    );
    
    // Select technical skills
    await user.click(screen.getByLabelText('Solidity'));
    await user.click(screen.getByLabelText('JavaScript'));
    
    // Agree to terms
    await user.click(screen.getByLabelText(/I agree to the community guidelines/));

    // Submit the form
    const submitButton = screen.getByText('Submit Application');
    await user.click(submitButton);

    // Wait for submission
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Create a mock file
    const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Resume\/Portfolio/);

    // Upload the file
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Selected: resume.pdf')).toBeInTheDocument();
    });
  });

  it('saves draft successfully', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Fill partial form data
    await user.type(screen.getByLabelText(/Full Name/), 'Jane Smith');
    await user.type(screen.getByLabelText(/Email Address/), 'jane@example.com');

    // Save draft
    const saveDraftButton = screen.getByText('Save Draft');
    await user.click(saveDraftButton);

    // Check for success indication
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    
    render(<JoinRequestForm {...defaultProps} onCancel={mockOnCancel} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email Address/);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates text length requirements', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Enter text that's too short
    const motivationField = screen.getByLabelText(/Why do you want to join/);
    await user.type(motivationField, 'Short text');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be at least 50 characters/)).toBeInTheDocument();
    });
  });

  it('displays community information correctly', async () => {
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check community details
    expect(screen.getByText('Web3 Developers Community')).toBeInTheDocument();
    expect(screen.getByText(/A community for Web3 developers/)).toBeInTheDocument();
    expect(screen.getByText('245 of 1000 members')).toBeInTheDocument();
  });

  it('handles multiselect fields correctly', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Select multiple skills
    await user.click(screen.getByLabelText('Solidity'));
    await user.click(screen.getByLabelText('React'));
    await user.click(screen.getByLabelText('TypeScript'));

    // Verify selections
    expect(screen.getByLabelText('Solidity')).toBeChecked();
    expect(screen.getByLabelText('React')).toBeChecked();
    expect(screen.getByLabelText('TypeScript')).toBeChecked();
  });

  it('shows error state when community fails to load', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load community information')).toBeInTheDocument();
    });
  });

  it('is accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Test tab navigation
    const fullNameInput = screen.getByLabelText(/Full Name/);
    fullNameInput.focus();
    
    expect(fullNameInput).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/Email Address/)).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/Web3 Experience Level/)).toHaveFocus();
  });

  it('handles form submission loading state', async () => {
    const user = userEvent.setup();
    render(<JoinRequestForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Fill required fields
    await user.type(screen.getByLabelText(/Full Name/), 'Test User');
    await user.type(screen.getByLabelText(/Email Address/), 'test@example.com');
    await user.selectOptions(screen.getByLabelText(/Web3 Experience Level/), 'Beginner');
    await user.type(
      screen.getByLabelText(/Why do you want to join/),
      'I want to learn more about Web3 and contribute to the community with my skills.'
    );
    await user.click(screen.getByLabelText('JavaScript'));
    await user.click(screen.getByLabelText(/I agree to the community guidelines/));

    // Submit form
    const submitButton = screen.getByText('Submit Application');
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByText('Submitting Application...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});