// Global Jest setup for all test environments
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser',
    role: 'member',
    walletAddress: '0x1234567890abcdef',
  },
  
  // Mock community data
  mockCommunity: {
    id: 'test-community-123',
    name: 'Test Community',
    description: 'A test community for unit testing',
    memberCount: 42,
    status: 'active',
    requiresApproval: true,
  },
  
  // Mock voting data
  mockPoll: {
    id: 'test-poll-123',
    title: 'Test Proposal',
    description: 'A test proposal for voting',
    options: ['Yes', 'No', 'Abstain'],
    endDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
  },
  
  // Mock join request data
  mockJoinRequest: {
    id: 'test-request-123',
    userId: 'test-user-123',
    communityId: 'test-community-123',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  },
  
  // Test delays
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock wallet functions
  mockWallet: {
    connect: jest.fn().mockResolvedValue({
      publicKey: '0x1234567890abcdef',
      connected: true,
    }),
    disconnect: jest.fn().mockResolvedValue(true),
    signMessage: jest.fn().mockResolvedValue('mock-signature'),
    signTransaction: jest.fn().mockResolvedValue('mock-tx-signature'),
  },
};

// Setup custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveLoadedWithin(received, expectedTime) {
    const pass = received <= expectedTime;
    if (pass) {
      return {
        message: () =>
          `expected ${received}ms not to be less than or equal to ${expectedTime}ms`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received}ms to be less than or equal to ${expectedTime}ms`,
        pass: false,
      };
    }
  },
});

// Error boundary for tests
export class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}