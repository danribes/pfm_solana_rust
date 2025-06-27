const { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Wallet } = require('@project-serum/anchor');
const bs58 = require('bs58');
require('dotenv').config();

/**
 * Solana Blockchain Client
 * Provides connection management, wallet handling, and network operations
 */
class SolanaClient {
  constructor() {
    this.connections = new Map();
    this.currentNetwork = process.env.SOLANA_NETWORK || 'devnet';
    this.connectionPool = new Map();
    this.maxRetries = parseInt(process.env.SOLANA_MAX_RETRIES || '3', 10);
    this.retryDelay = parseInt(process.env.SOLANA_RETRY_DELAY || '1000', 10);
    
    this.networks = {
      localhost: 'http://localhost:8899',
      devnet: clusterApiUrl('devnet'),
      testnet: clusterApiUrl('testnet'),
      mainnet: clusterApiUrl('mainnet-beta')
    };
    
    this.initializeConnections();
  }

  /**
   * Initialize connections for all networks
   */
  initializeConnections() {
    try {
      console.log('Initializing Solana connections...');
      
      for (const [network, endpoint] of Object.entries(this.networks)) {
        const connection = new Connection(endpoint, {
          commitment: 'confirmed',
          wsEndpoint: network === 'localhost' ? 'ws://localhost:8900' : undefined
        });
        
        this.connections.set(network, connection);
        console.log(`Initialized connection for ${network}: ${endpoint}`);
      }
      
      console.log('Solana connections initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Solana connections:', error.message);
      throw error;
    }
  }

  /**
   * Get connection for current network
   */
  getConnection(network = null) {
    const targetNetwork = network || this.currentNetwork;
    const connection = this.connections.get(targetNetwork);
    
    if (!connection) {
      throw new Error(`No connection available for network: ${targetNetwork}`);
    }
    
    return connection;
  }

  /**
   * Switch to a different network
   */
  switchNetwork(network) {
    if (!this.networks[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }
    
    this.currentNetwork = network;
    console.log(`Switched to network: ${network}`);
    return this.getConnection();
  }

  /**
   * Get current network
   */
  getCurrentNetwork() {
    return this.currentNetwork;
  }

  /**
   * Get available networks
   */
  getAvailableNetworks() {
    return Object.keys(this.networks);
  }

  /**
   * Create wallet from private key
   */
  createWallet(privateKey) {
    try {
      let keypair;
      
      if (typeof privateKey === 'string') {
        // Handle base58 encoded private key
        const decoded = bs58.decode(privateKey);
        keypair = Keypair.fromSecretKey(decoded);
      } else if (privateKey instanceof Uint8Array) {
        // Handle byte array
        keypair = Keypair.fromSecretKey(privateKey);
      } else {
        throw new Error('Invalid private key format');
      }
      
      return new Wallet(keypair);
    } catch (error) {
      console.error('Failed to create wallet:', error.message);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(publicKey, network = null) {
    try {
      const connection = this.getConnection(network);
      const pubKey = new PublicKey(publicKey);
      
      const balance = await this.retryOperation(async () => {
        return await connection.getBalance(pubKey);
      });
      
      return {
        lamports: balance,
        sol: balance / LAMPORTS_PER_SOL,
        network: network || this.currentNetwork
      };
    } catch (error) {
      console.error('Failed to get balance:', error.message);
      throw error;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(publicKey, network = null) {
    try {
      const connection = this.getConnection(network);
      const pubKey = new PublicKey(publicKey);
      
      const accountInfo = await this.retryOperation(async () => {
        return await connection.getAccountInfo(pubKey);
      });
      
      return accountInfo;
    } catch (error) {
      console.error('Failed to get account info:', error.message);
      throw error;
    }
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash(network = null) {
    try {
      const connection = this.getConnection(network);
      
      const blockhash = await this.retryOperation(async () => {
        const { blockhash } = await connection.getLatestBlockhash();
        return blockhash;
      });
      
      return blockhash;
    } catch (error) {
      console.error('Failed to get recent blockhash:', error.message);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature, network = null) {
    try {
      const connection = this.getConnection(network);
      
      const status = await this.retryOperation(async () => {
        const response = await connection.getSignatureStatus(signature);
        return response?.value;
      });
      
      return status;
    } catch (error) {
      console.error('Failed to get transaction status:', error.message);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature, network = null) {
    try {
      const connection = this.getConnection(network);
      
      const transaction = await this.retryOperation(async () => {
        return await connection.getTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
      });
      
      return transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error.message);
      throw error;
    }
  }

  /**
   * Get cluster nodes
   */
  async getClusterNodes(network = null) {
    try {
      const connection = this.getConnection(network);
      
      const nodes = await this.retryOperation(async () => {
        return await connection.getClusterNodes();
      });
      
      return nodes;
    } catch (error) {
      console.error('Failed to get cluster nodes:', error.message);
      throw error;
    }
  }

  /**
   * Get cluster version
   */
  async getClusterVersion(network = null) {
    try {
      const connection = this.getConnection(network);
      
      const version = await this.retryOperation(async () => {
        return await connection.getVersion();
      });
      
      return version;
    } catch (error) {
      console.error('Failed to get cluster version:', error.message);
      throw error;
    }
  }

  /**
   * Get slot info
   */
  async getSlotInfo(slot, network = null) {
    try {
      const connection = this.getConnection(network);
      
      const slotInfo = await this.retryOperation(async () => {
        return await connection.getSlotInfo(slot);
      });
      
      return slotInfo;
    } catch (error) {
      console.error('Failed to get slot info:', error.message);
      throw error;
    }
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(network = null) {
    try {
      const connection = this.getConnection(network);
      
      const slot = await this.retryOperation(async () => {
        return await connection.getSlot();
      });
      
      return slot;
    } catch (error) {
      console.error('Failed to get current slot:', error.message);
      throw error;
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, retries = null) {
    const maxRetries = retries || this.maxRetries;
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate public key
   */
  isValidPublicKey(publicKey) {
    try {
      new PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate private key
   */
  isValidPrivateKey(privateKey) {
    try {
      if (typeof privateKey === 'string') {
        bs58.decode(privateKey);
      } else if (privateKey instanceof Uint8Array) {
        // Valid byte array
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get connection health status
   */
  async getConnectionHealth(network = null) {
    try {
      const connection = this.getConnection(network);
      const startTime = Date.now();
      
      // Test basic operations
      await connection.getSlot();
      const responseTime = Date.now() - startTime;
      
      return {
        network: network || this.currentNetwork,
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        network: network || this.currentNetwork,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get all connection health statuses
   */
  async getAllConnectionHealth() {
    const healthStatuses = [];
    
    for (const network of Object.keys(this.networks)) {
      const health = await this.getConnectionHealth(network);
      healthStatuses.push(health);
    }
    
    return healthStatuses;
  }

  /**
   * Close all connections
   */
  async closeConnections() {
    try {
      console.log('Closing Solana connections...');
      
      for (const [network, connection] of this.connections) {
        if (connection._rpcWebSocket) {
          connection._rpcWebSocket.close();
        }
      }
      
      this.connections.clear();
      console.log('Solana connections closed successfully');
    } catch (error) {
      console.error('Failed to close connections:', error.message);
    }
  }
}

// Create singleton instance
const solanaClient = new SolanaClient();

module.exports = solanaClient; 