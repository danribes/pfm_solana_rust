# Wallet Connection Infrastructure

This directory contains the complete wallet connection infrastructure for the PFM Community Management Application, providing seamless Solana wallet integration for both admin and member portals.

## Overview

The wallet connection infrastructure includes:

- **Multi-wallet support** - Phantom, Solflare, Backpack, Glow, Slope
- **Network switching** - Mainnet, Devnet, Testnet support
- **Auto-connection** - Remember user preferences
- **Error handling** - Comprehensive error management
- **TypeScript support** - Full type safety
- **React hooks** - Easy integration with React components
- **UI components** - Ready-to-use wallet components

## Architecture

### Core Files

```
frontend/shared/
├── types/wallet.ts              # TypeScript definitions
├── config/wallet.ts             # Wallet configuration
├── utils/wallet.ts              # Utility functions
├── contexts/WalletContext.tsx   # React context provider
├── hooks/useWallet.ts           # Custom wallet hook
└── components/WalletConnection/
    ├── WalletButton.tsx         # Wallet connection button
    ├── WalletModal.tsx          # Wallet selection modal
    ├── WalletStatus.tsx         # Connection status display
    ├── WalletConnectionProvider.tsx  # Main provider wrapper
    ├── index.ts                 # Exports
    └── README.md               # This file
```

### Dependencies

The implementation uses the following key dependencies:

- `@solana/wallet-adapter-react` - React hooks for wallet integration
- `@solana/wallet-adapter-react-ui` - UI components
- `@solana/wallet-adapter-wallets` - Specific wallet adapters
- `@solana/web3.js` - Solana blockchain interaction
- `@headlessui/react` - UI components
- `@heroicons/react` - Icons

## Usage

### Basic Integration

```tsx
import { WalletConnectionProvider, WalletButton } from '@/components/WalletConnection';

function App() {
  return (
    <WalletConnectionProvider network="devnet" autoConnect={true}>
      <WalletButton />
    </WalletConnectionProvider>
  );
}
```

### Advanced Integration with Hooks

```tsx
import { useWallet, WalletConnectionProvider } from '@/components/WalletConnection';

function MyComponent() {
  const { 
    connected, 
    connecting, 
    publicKey, 
    connect, 
    disconnect 
  } = useWallet();

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {publicKey?.toString()}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
```

### Admin Portal Integration

```tsx
import { WalletConnectionProvider, WalletButton, WalletStatus } from '@/components/WalletConnection';

function AdminLayout({ children }) {
  return (
    <WalletConnectionProvider network="mainnet-beta">
      <header>
        <h1>Admin Portal</h1>
        <div>
          <WalletStatus variant="minimal" />
          <WalletButton variant="outline" size="sm" />
        </div>
      </header>
      <main>{children}</main>
    </WalletConnectionProvider>
  );
}
```

### Member Portal Integration

```tsx
import { WalletConnectionProvider, useWallet } from '@/components/WalletConnection';

function MemberDashboard() {
  const { connected, shortAddress } = useWallet();

  return (
    <div>
      {connected ? (
        <div>
          <h1>Welcome, {shortAddress}</h1>
          {/* Member content */}
        </div>
      ) : (
        <div>
          <h1>Please connect your wallet to continue</h1>
          <WalletButton />
        </div>
      )}
    </div>
  );
}
```

## Components

### WalletButton

A customizable button component for wallet connection.

**Props:**
- `className?: string` - Additional CSS classes
- `showDropdown?: boolean` - Show dropdown arrow when connected
- `variant?: 'primary' | 'secondary' | 'outline'` - Button style variant
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `onClick?: () => void` - Custom click handler

### WalletModal

A modal component for wallet selection and connection.

**Props:**
- `isOpen: boolean` - Modal visibility state
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `description?: string` - Modal description

### WalletStatus

A status component showing wallet connection information.

**Props:**
- `className?: string` - Additional CSS classes
- `showNetwork?: boolean` - Show network information
- `showAddress?: boolean` - Show wallet address
- `variant?: 'full' | 'minimal' | 'badge'` - Display variant

### WalletConnectionProvider

The main provider component that wraps your application.

**Props:**
- `children: React.ReactNode` - Child components
- `network?: 'mainnet-beta' | 'devnet' | 'testnet'` - Solana network
- `autoConnect?: boolean` - Enable auto-connection
- `onConnect?: (publicKey: string) => void` - Connection callback
- `onDisconnect?: () => void` - Disconnection callback
- `onError?: (error: WalletError) => void` - Error callback

## Hooks

### useWallet

The main hook for wallet functionality.

**Returns:**
```typescript
{
  // Connection state
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  walletName: string | null;
  error: WalletError | null;

  // Formatted values
  address: string;
  shortAddress: string;

  // Connection functions
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletName: string) => void;

  // Wallet management
  supportedWallets: SupportedWallet[];
  installedWallets: SupportedWallet[];
  availableWallets: SupportedWallet[];

  // Network management
  networkName: string;
  networkDisplayName: string;
  switchNetwork: (network: string) => Promise<void>;

  // Preferences
  autoConnect: boolean;
  lastConnectedWallet: string | null;
  setAutoConnect: (enabled: boolean) => void;

  // Utility functions
  isValidConnection: boolean;
  canConnect: boolean;
  requiresInstallation: (walletName: string) => boolean;
  getWalletDownloadUrl: (walletName: string) => string | null;
}
```

## Configuration

### Supported Wallets

Currently supported wallets:
- **Phantom** - Most popular Solana wallet
- **Solflare** - Feature-rich wallet with DeFi focus
- **Backpack** - Modern wallet with social features
- **Glow** - Security-focused wallet
- **Slope** - Mobile-first wallet

### Networks

Supported networks:
- **Mainnet Beta** - Production Solana network
- **Devnet** - Development network for testing
- **Testnet** - Public testing network

### Environment Variables

Configure RPC endpoints via environment variables:

```env
NEXT_PUBLIC_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_TESTNET_RPC_URL=https://api.testnet.solana.com
NEXT_PUBLIC_LOCALHOST_RPC_URL=http://localhost:8899
```

## Error Handling

The system provides comprehensive error handling:

```typescript
enum WalletErrorCode {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  CONNECTION_FAILED = 'CONNECTION_FAILED', 
  DISCONNECTION_FAILED = 'DISCONNECTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

## Local Storage

The system uses localStorage to persist:
- Last connected wallet
- Auto-connect preferences  
- Network preferences
- User settings

Storage keys are prefixed with `pfm_` for namespace isolation.

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

- `WalletConnectionState` - Connection state interface
- `WalletError` - Error type definitions
- `WalletPreferences` - User preference types
- `SupportedWallet` - Wallet configuration types
- `NetworkInfo` - Network configuration types

## Testing

### Unit Tests

Test wallet utilities:
```bash
npm test utils/wallet.test.ts
```

### Integration Tests

Test wallet components:
```bash
npm test components/WalletConnection/
```

### E2E Tests

Test complete wallet flows:
```bash
npm run test:e2e
```

## Security Considerations

1. **Never store private keys** - Wallets handle key management
2. **Validate connections** - Always verify wallet state
3. **Handle errors gracefully** - Provide user-friendly error messages
4. **Use secure endpoints** - Prefer HTTPS RPC endpoints
5. **Implement timeouts** - Prevent hanging connections

## Performance

### Optimization Features

- **Lazy loading** - Components load on demand
- **Memoization** - Expensive computations are cached
- **Connection pooling** - Efficient RPC usage
- **Auto-retry** - Automatic retry on failures
- **Debouncing** - Prevent rapid state changes

### Best Practices

1. **Wrap only necessary components** - Don't over-wrap with providers
2. **Use hooks efficiently** - Avoid unnecessary re-renders
3. **Handle loading states** - Show appropriate loading indicators
4. **Cache wallet preferences** - Reduce repeated calculations
5. **Monitor connection health** - Implement connection health checks

## Troubleshooting

### Common Issues

**Wallet not detected:**
- Ensure wallet extension is installed
- Check browser compatibility
- Verify wallet is unlocked

**Connection timeout:**
- Check network connectivity
- Verify RPC endpoint is accessible
- Try different wallet

**Transaction failures:**
- Ensure sufficient SOL balance
- Check network congestion
- Verify transaction parameters

### Debug Mode

Enable debug logging in development:

```typescript
import { debugWalletState } from '@/utils/wallet';

// In your component
const { wallet, publicKey, connected } = useWallet();
debugWalletState(wallet, publicKey, connected);
```

## Examples

Complete examples are available in:
- `frontend/shared/examples/wallet-integration-example.tsx`

## Contributing

When adding new wallets:

1. Add wallet adapter to dependencies
2. Update `getWalletAdapters()` in config
3. Add wallet info to `SUPPORTED_WALLETS`
4. Update detection logic in utils
5. Add tests for new wallet
6. Update documentation

## Next Steps

Future enhancements planned:
- Hardware wallet support (Ledger, Trezor)
- Multi-signature wallet support  
- Wallet analytics and metrics
- Advanced security features
- Mobile wallet support improvements

---

## Task Completion ✅

**Task 4.2.1: Wallet Connection Infrastructure** has been successfully implemented with:

- ✅ Multi-wallet provider integration (Phantom, Solflare, Backpack, Glow, Slope)
- ✅ Wallet detection and connection logic
- ✅ State management with React context
- ✅ Connection UI components (button, modal, status)
- ✅ Network switching capabilities
- ✅ Auto-connect and preference persistence
- ✅ Comprehensive error handling
- ✅ TypeScript support with full type definitions
- ✅ Utility functions for wallet operations
- ✅ Example implementations for admin and member portals
- ✅ Documentation and integration guides

The infrastructure is ready for integration into both admin and member portals and provides a solid foundation for all wallet-related functionality in the application. 