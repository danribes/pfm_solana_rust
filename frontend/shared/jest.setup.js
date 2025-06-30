// Jest DOM setup for testing
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    publicKey: null,
    wallet: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
  }),
  useConnection: () => ({
    connection: {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test', lastValidBlockHeight: 100 }),
      confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    },
  }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SOLANA_RPC = 'http://localhost:8899'
process.env.NEXT_PUBLIC_SOLANA_WS = 'ws://localhost:8900'
process.env.NEXT_PUBLIC_CONTAINER_MODE = 'true'

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    return originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 