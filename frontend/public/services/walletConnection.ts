// Task 7.1.3: Public User Registration & Wallet Connection
// Wallet connection service for multi-wallet support

// Global type declarations for wallet providers
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    };
    solflare?: any;
    ethereum?: any;
  }
}

import {
  WalletProvider,
  WalletInfo,
  WalletConnection,
  WalletConnectionResult,
  WalletSignatureRequest,
  WalletVerificationResponse,
  REGISTRATION_ERROR_CODES
} from '@/types/registration';

// Wallet provider configurations
export const WALLET_CONFIGS: Record<WalletProvider, WalletInfo> = {
  phantom: {
    provider: 'phantom',
    name: 'Phantom',
    icon: '/icons/wallets/phantom.svg',
    website: 'https://phantom.app',
    description: 'A friendly Solana wallet built for DeFi & NFTs',
    platforms: ['web', 'mobile', 'extension'],
    installUrl: {
      chrome: 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/phantom-app/',
      ios: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
      android: 'https://play.google.com/store/apps/details?id=app.phantom'
    },
    isInstalled: false,
    isDetected: false
  },
  solflare: {
    provider: 'solflare',
    name: 'Solflare',
    icon: '/icons/wallets/solflare.svg',
    website: 'https://solflare.com',
    description: 'Powerful Solana wallet for DeFi, NFTs, and Web3',
    platforms: ['web', 'mobile', 'extension'],
    installUrl: {
      chrome: 'https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet/',
      ios: 'https://apps.apple.com/app/solflare/id1580902717',
      android: 'https://play.google.com/store/apps/details?id=com.solflare.mobile'
    },
    isInstalled: false,
    isDetected: false
  },
  metamask: {
    provider: 'metamask',
    name: 'MetaMask',
    icon: '/icons/wallets/metamask.svg',
    website: 'https://metamask.io',
    description: 'The world\'s leading crypto wallet for Ethereum',
    platforms: ['web', 'mobile', 'extension'],
    installUrl: {
      chrome: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/',
      ios: 'https://apps.apple.com/app/metamask/id1438144202',
      android: 'https://play.google.com/store/apps/details?id=io.metamask'
    },
    isInstalled: false,
    isDetected: false
  },
  walletconnect: {
    provider: 'walletconnect',
    name: 'WalletConnect',
    icon: '/icons/wallets/walletconnect.svg',
    website: 'https://walletconnect.com',
    description: 'Connect to hundreds of wallets via QR code',
    platforms: ['web', 'mobile'],
    installUrl: {},
    isInstalled: true, // Always available via QR
    isDetected: true
  },
  coinbase: {
    provider: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/icons/wallets/coinbase.svg',
    website: 'https://wallet.coinbase.com',
    description: 'The easiest and most secure crypto wallet',
    platforms: ['web', 'mobile', 'extension'],
    installUrl: {
      chrome: 'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
      ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
      android: 'https://play.google.com/store/apps/details?id=org.toshi'
    },
    isInstalled: false,
    isDetected: false
  },
  ledger: {
    provider: 'ledger',
    name: 'Ledger',
    icon: '/icons/wallets/ledger.svg',
    website: 'https://www.ledger.com',
    description: 'Hardware wallet for maximum security',
    platforms: ['web'],
    installUrl: {
      chrome: 'https://chrome.google.com/webstore/detail/ledger-wallet/kkdpmhnladdopljabkgpacgpliggeeaf'
    },
    isInstalled: false,
    isDetected: false
  },
  trezor: {
    provider: 'trezor',
    name: 'Trezor',
    icon: '/icons/wallets/trezor.svg',
    website: 'https://trezor.io',
    description: 'Original hardware wallet for crypto security',
    platforms: ['web'],
    installUrl: {},
    isInstalled: false,
    isDetected: false
  }
};

// Wallet detection and connection service
class WalletConnectionService {
  private connectedWallet: WalletConnection | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeWalletDetection();
  }

  // Detect available wallets
  private initializeWalletDetection() {
    if (typeof window === 'undefined') return;

    // Phantom detection
    if (window.solana?.isPhantom) {
      WALLET_CONFIGS.phantom.isDetected = true;
      WALLET_CONFIGS.phantom.isInstalled = true;
    }

    // Solflare detection
    if (window.solflare) {
      WALLET_CONFIGS.solflare.isDetected = true;
      WALLET_CONFIGS.solflare.isInstalled = true;
    }

    // MetaMask detection
    if (window.ethereum?.isMetaMask) {
      WALLET_CONFIGS.metamask.isDetected = true;
      WALLET_CONFIGS.metamask.isInstalled = true;
    }

    // Coinbase detection
    if (window.ethereum?.isCoinbaseWallet) {
      WALLET_CONFIGS.coinbase.isDetected = true;
      WALLET_CONFIGS.coinbase.isInstalled = true;
    }

    // WalletConnect is always available
    WALLET_CONFIGS.walletconnect.isDetected = true;
    WALLET_CONFIGS.walletconnect.isInstalled = true;
  }

  // Get available wallets
  getAvailableWallets(): WalletInfo[] {
    return Object.values(WALLET_CONFIGS);
  }

  // Get installed wallets only
  getInstalledWallets(): WalletInfo[] {
    return Object.values(WALLET_CONFIGS).filter(wallet => wallet.isInstalled);
  }

  // Connect to specific wallet
  async connectWallet(provider: WalletProvider): Promise<WalletConnectionResult> {
    try {
      switch (provider) {
        case 'phantom':
          return await this.connectPhantom();
        case 'solflare':
          return await this.connectSolflare();
        case 'metamask':
          return await this.connectMetaMask();
        case 'walletconnect':
          return await this.connectWalletConnect();
        case 'coinbase':
          return await this.connectCoinbase();
        case 'ledger':
          return await this.connectLedger();
        case 'trezor':
          return await this.connectTrezor();
        default:
          throw new Error(`Wallet provider ${provider} not supported`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${provider}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Phantom connection
  private async connectPhantom(): Promise<WalletConnectionResult> {
    if (!window.solana?.isPhantom) {
      return {
        success: false,
        error: 'Phantom wallet not detected. Please install Phantom.'
      };
    }

    try {
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();
      
      // Get balance (optional) - skip for public landing page
      let balance;
      try {
        // Balance fetching would require @solana/web3.js package
        // For the public landing page, we'll skip this to avoid dependency
        balance = undefined;
      } catch (e) {
        console.warn('Failed to get balance:', e);
      }

      const connection: WalletConnection = {
        provider: 'phantom',
        address: publicKey,
        publicKey,
        isConnected: true,
        balance,
        network: 'solana-mainnet'
      };

      this.connectedWallet = connection;
      this.emitEvent('walletConnected', connection);

      return {
        success: true,
        connection,
        requiresSignature: true,
        signatureMessage: this.generateSignatureMessage()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Phantom'
      };
    }
  }

  // Solflare connection
  private async connectSolflare(): Promise<WalletConnectionResult> {
    if (!window.solflare) {
      return {
        success: false,
        error: 'Solflare wallet not detected. Please install Solflare.'
      };
    }

    try {
      const response = await window.solflare.connect();
      const publicKey = response.publicKey.toString();

      const connection: WalletConnection = {
        provider: 'solflare',
        address: publicKey,
        publicKey,
        isConnected: true,
        network: 'solana-mainnet'
      };

      this.connectedWallet = connection;
      this.emitEvent('walletConnected', connection);

      return {
        success: true,
        connection,
        requiresSignature: true,
        signatureMessage: this.generateSignatureMessage()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Solflare'
      };
    }
  }

  // MetaMask connection
  private async connectMetaMask(): Promise<WalletConnectionResult> {
    if (!window.ethereum?.isMetaMask) {
      return {
        success: false,
        error: 'MetaMask not detected. Please install MetaMask.'
      };
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Get balance
      let balance;
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        balance = parseInt(balanceHex, 16) / 1e18; // Convert wei to ETH
      } catch (e) {
        console.warn('Failed to get balance:', e);
      }

      const connection: WalletConnection = {
        provider: 'metamask',
        address,
        publicKey: address,
        isConnected: true,
        balance,
        chainId,
        network: this.getNetworkName(chainId)
      };

      this.connectedWallet = connection;
      this.emitEvent('walletConnected', connection);

      return {
        success: true,
        connection,
        requiresSignature: true,
        signatureMessage: this.generateSignatureMessage()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MetaMask'
      };
    }
  }

  // WalletConnect connection
  private async connectWalletConnect(): Promise<WalletConnectionResult> {
    try {
      // This would typically use WalletConnect library
      // For now, return a mock implementation
      return {
        success: false,
        error: 'WalletConnect integration coming soon'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect via WalletConnect'
      };
    }
  }

  // Coinbase connection
  private async connectCoinbase(): Promise<WalletConnectionResult> {
    if (!window.ethereum?.isCoinbaseWallet) {
      return {
        success: false,
        error: 'Coinbase Wallet not detected. Please install Coinbase Wallet.'
      };
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      const connection: WalletConnection = {
        provider: 'coinbase',
        address,
        publicKey: address,
        isConnected: true,
        chainId,
        network: this.getNetworkName(chainId)
      };

      this.connectedWallet = connection;
      this.emitEvent('walletConnected', connection);

      return {
        success: true,
        connection,
        requiresSignature: true,
        signatureMessage: this.generateSignatureMessage()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Coinbase Wallet'
      };
    }
  }

  // Ledger connection
  private async connectLedger(): Promise<WalletConnectionResult> {
    return {
      success: false,
      error: 'Ledger integration coming soon'
    };
  }

  // Trezor connection
  private async connectTrezor(): Promise<WalletConnectionResult> {
    return {
      success: false,
      error: 'Trezor integration coming soon'
    };
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    if (!this.connectedWallet) return;

    try {
      const provider = this.connectedWallet.provider;
      
      // Provider-specific disconnect logic
      switch (provider) {
        case 'phantom':
          if (window.solana?.isPhantom) {
            await window.solana.disconnect();
          }
          break;
        case 'solflare':
          if (window.solflare) {
            await window.solflare.disconnect();
          }
          break;
        // MetaMask and others don't have a disconnect method
      }

      this.connectedWallet = null;
      this.emitEvent('walletDisconnected', null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Still clear the connection even if disconnect fails
      this.connectedWallet = null;
      this.emitEvent('walletDisconnected', null);
    }
  }

  // Get current connection
  getCurrentConnection(): WalletConnection | null {
    return this.connectedWallet;
  }

  // Sign message for verification
  async signMessage(message: string): Promise<string> {
    if (!this.connectedWallet) {
      throw new Error('No wallet connected');
    }

    const provider = this.connectedWallet.provider;

    try {
      switch (provider) {
        case 'phantom':
          if (!window.solana?.isPhantom) throw new Error('Phantom not available');
          const phantomSignature = await window.solana.signMessage(
            new TextEncoder().encode(message)
          );
          return Buffer.from(phantomSignature.signature).toString('hex');

        case 'solflare':
          if (!window.solflare) throw new Error('Solflare not available');
          const solflareSignature = await window.solflare.signMessage(
            new TextEncoder().encode(message),
            'utf8'
          );
          return Buffer.from(solflareSignature.signature).toString('hex');

        case 'metamask':
        case 'coinbase':
          if (!window.ethereum) throw new Error('Ethereum provider not available');
          return await window.ethereum.request({
            method: 'personal_sign',
            params: [message, this.connectedWallet.address]
          });

        default:
          throw new Error(`Signing not implemented for ${provider}`);
      }
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Generate signature message for verification
  private generateSignatureMessage(): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    return `Welcome to PFM Platform!\n\nPlease sign this message to verify your wallet ownership.\n\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nThis action will not spend any funds.`;
  }

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback);
    }
  }

  private emitEvent(event: string, data: any) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in wallet event listener:', error);
        }
      });
    }
  }

  // Helper methods
  private getNetworkName(chainId: string): string {
    switch (chainId) {
      case '0x1': return 'ethereum-mainnet';
      case '0x3': return 'ethereum-ropsten';
      case '0x4': return 'ethereum-rinkeby';
      case '0x5': return 'ethereum-goerli';
      case '0x89': return 'polygon-mainnet';
      case '0x13881': return 'polygon-mumbai';
      default: return `unknown-${chainId}`;
    }
  }

  // Check if wallet supports network
  supportsNetwork(provider: WalletProvider, network: string): boolean {
    switch (provider) {
      case 'phantom':
      case 'solflare':
        return network.startsWith('solana');
      case 'metamask':
      case 'coinbase':
      case 'walletconnect':
        return network.startsWith('ethereum') || network.startsWith('polygon');
      case 'ledger':
      case 'trezor':
        return true; // Hardware wallets support multiple networks
      default:
        return false;
    }
  }
}

// Create singleton instance
const walletConnectionService = new WalletConnectionService();

// Export main functions
export const getAvailableWallets = () => walletConnectionService.getAvailableWallets();
export const getInstalledWallets = () => walletConnectionService.getInstalledWallets();
export const connectWallet = (provider: WalletProvider) => walletConnectionService.connectWallet(provider);
export const disconnectWallet = () => walletConnectionService.disconnectWallet();
export const getCurrentConnection = () => walletConnectionService.getCurrentConnection();
export const signMessage = (message: string) => walletConnectionService.signMessage(message);
export const addEventListener = (event: string, callback: Function) => 
  walletConnectionService.addEventListener(event, callback);
export const removeEventListener = (event: string, callback: Function) => 
  walletConnectionService.removeEventListener(event, callback);

// Wallet verification API functions
export const requestWalletSignature = async (): Promise<WalletSignatureRequest> => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);
  
  return {
    message: `Welcome to PFM Platform!\n\nPlease sign this message to verify your wallet ownership.\n\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nThis action will not spend any funds.`,
    nonce,
    expiresAt: new Date(timestamp + 5 * 60 * 1000).toISOString() // 5 minutes
  };
};

export const verifyWalletSignature = async (
  walletAddress: string,
  signature: string,
  message: string
): Promise<WalletVerificationResponse> => {
  try {
    // In production, this would make an API call to verify the signature
    const response = await fetch('/api/auth/verify-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        signature,
        message
      })
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Wallet verification error:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
};

// Mock verification for development
export const mockVerifyWalletSignature = async (
  walletAddress: string,
  signature: string,
  message: string
): Promise<WalletVerificationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock verification (always succeeds for demo)
  return {
    success: true,
    verified: true,
    walletAddress
  };
};

// Utility functions
export const isWalletInstalled = (provider: WalletProvider): boolean => {
  return WALLET_CONFIGS[provider]?.isInstalled || false;
};

export const getWalletInstallUrl = (provider: WalletProvider): string => {
  const config = WALLET_CONFIGS[provider];
  if (!config) return '';
  
  // Detect browser and return appropriate install URL
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome')) {
    return config.installUrl.chrome || config.website;
  } else if (userAgent.includes('firefox')) {
    return config.installUrl.firefox || config.website;
  } else if (userAgent.includes('safari')) {
    return config.installUrl.safari || config.website;
  }
  
  return config.website;
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getMobileWalletUrl = (provider: WalletProvider): string => {
  const config = WALLET_CONFIGS[provider];
  if (!config) return '';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) {
    return config.installUrl.android || '';
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return config.installUrl.ios || '';
  }
  
  return '';
};

// Export service instance
export default walletConnectionService; 