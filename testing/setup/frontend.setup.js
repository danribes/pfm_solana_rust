// Frontend-specific Jest setup
import React from 'react';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Add TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return React.cloneElement(children, {
      href,
      ...props,
    });
  };
});

// Mock Wallet Context
const mockWalletContext = {
  wallet: null,
  connected: false,
  connecting: false,
  publicKey: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  signMessage: jest.fn(),
  signTransaction: jest.fn(),
};

jest.mock('@/contexts/WalletContext', () => ({
  useWallet: () => mockWalletContext,
  WalletProvider: ({ children }) => children,
}));

// Mock Auth Context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

// Mock Notification Context
const mockNotificationContext = {
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
};

jest.mock('@/contexts/NotificationContext', () => ({
  useNotifications: () => mockNotificationContext,
  NotificationProvider: ({ children }) => children,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock file handling
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.name = filename;
    this.size = parts.reduce((acc, part) => acc + part.length, 0);
    this.type = properties?.type || 'text/plain';
    this.lastModified = Date.now();
  }
};

global.FileReader = class MockFileReader {
  constructor() {
    this.result = null;
    this.error = null;
    this.readyState = 0;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock-file-content`;
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 100);
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = 'mock file content';
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 100);
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// Mock geolocation API
Object.assign(navigator, {
  geolocation: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock crypto API for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123',
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock Web APIs
global.MutationObserver = class MutationObserver {
  constructor() {}
  observe() {}
  disconnect() {}
};

// Custom render function for React components with providers
export const renderWithProviders = (ui, options = {}) => {
  const { preloadedState = {}, ...renderOptions } = options;
  
  function Wrapper({ children }) {
    return (
      <React.StrictMode>
        {children}
      </React.StrictMode>
    );
  }
  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Test utilities for frontend
export const frontendTestUtils = {
  // Mock event objects
  mockEvent: (overrides = {}) => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    ...overrides,
  }),
  
  // Mock file input
  mockFileInput: (files = []) => ({
    target: {
      files,
      value: files.length > 0 ? files[0].name : '',
    },
  }),
  
  // Mock form data
  mockFormData: (data = {}) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },
  
  // Create mock component props
  createMockProps: (overrides = {}) => ({
    ...overrides,
  }),
  
  // Wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Make test utilities available globally
global.frontendTestUtils = frontendTestUtils;