/**
 * End-to-End Authentication Flow Test
 * Tests the complete wallet-based authentication flow in containerized environment
 */

const axios = require('axios');
const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');

const API_BASE_URL = 'http://localhost:3000';

class AuthenticationE2ETest {
  constructor() {
    this.testWallet = null;
    this.testWalletAddress = null;
    this.sessionData = null;
  }

  /**
   * Generate a test wallet keypair
   */
  generateTestWallet() {
    this.testWallet = Keypair.generate();
    this.testWalletAddress = this.testWallet.publicKey.toString();
    console.log(`Generated test wallet: ${this.testWalletAddress}`);
    return this.testWallet;
  }

  /**
   * Sign a message using the test wallet
   */
  signMessage(message) {
    const messageBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageBytes, this.testWallet.secretKey);
    return Buffer.from(signature).toString('base64');
  }

  /**
   * Test 1: Generate authentication nonce
   */
  async testNonceGeneration() {
    console.log('\n=== Test 1: Nonce Generation ===');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/wallet/nonce`, {
        walletAddress: this.testWalletAddress
      });

      if (response.data.success && response.data.data.nonce) {
        console.log('✅ Nonce generation successful');
        console.log(`   Nonce: ${response.data.data.nonce.substring(0, 16)}...`);
        console.log(`   Timestamp: ${response.data.data.timestamp}`);
        return response.data.data;
      } else {
        throw new Error('Nonce generation failed');
      }
    } catch (error) {
      console.log('❌ Nonce generation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test 2: Verify wallet signature
   */
  async testSignatureVerification(nonceData) {
    console.log('\n=== Test 2: Signature Verification ===');
    
    try {
      const signature = this.signMessage(nonceData.message);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/wallet/verify`, {
        walletAddress: this.testWalletAddress,
        signature: signature,
        nonce: nonceData.nonce,
        timestamp: nonceData.timestamp
      });

      if (response.data.success) {
        console.log('✅ Signature verification successful');
        return true;
      } else {
        throw new Error('Signature verification failed');
      }
    } catch (error) {
      console.log('❌ Signature verification failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test 3: Connect wallet and authenticate
   */
  async testWalletConnection(nonceData) {
    console.log('\n=== Test 3: Wallet Connection & Authentication ===');
    
    try {
      const signature = this.signMessage(nonceData.message);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/wallet/connect`, {
        walletAddress: this.testWalletAddress,
        signature: signature,
        nonce: nonceData.nonce,
        timestamp: nonceData.timestamp,
        userData: {
          username: `user_${Date.now().toString().slice(-6)}`,
          email: `test_${Date.now()}@example.com`
        }
      });

      if (response.data.success && response.data.data.token) {
        console.log('✅ Wallet connection successful');
        console.log(`   User ID: ${response.data.data.user.id}`);
        console.log(`   Username: ${response.data.data.user.username}`);
        console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
        
        this.sessionData = response.data.data;
        return this.sessionData;
      } else {
        throw new Error('Wallet connection failed');
      }
    } catch (error) {
      console.log('❌ Wallet connection failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test 4: Check wallet status
   */
  async testWalletStatus() {
    console.log('\n=== Test 4: Wallet Status Check ===');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/wallet/${this.testWalletAddress}/status`);

      if (response.data.success && response.data.data.connected) {
        console.log('✅ Wallet status check successful');
        console.log(`   Connected: ${response.data.data.connected}`);
        console.log(`   Is Active: ${response.data.data.isActive}`);
        console.log(`   Has Profile: ${response.data.data.hasProfile}`);
        return response.data.data;
      } else {
        throw new Error('Wallet status check failed');
      }
    } catch (error) {
      console.log('❌ Wallet status check failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test 5: Refresh authentication token
   */
  async testTokenRefresh() {
    console.log('\n=== Test 5: Token Refresh ===');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/wallet/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${this.sessionData.token}`
        }
      });

      if (response.data.success) {
        console.log('✅ Token refresh successful');
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.log('❌ Token refresh failed:', error.response?.data || error.message);
      // This might fail if middleware auth is not implemented yet - that's OK
      console.log('   (This is expected if session middleware is not fully implemented)');
      return false;
    }
  }

  /**
   * Test 6: Rate limiting
   */
  async testRateLimiting() {
    console.log('\n=== Test 6: Rate Limiting ===');
    
    try {
      // Generate multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          axios.post(`${API_BASE_URL}/api/auth/wallet/nonce`, {
            walletAddress: this.testWalletAddress
          })
        );
      }

      const responses = await Promise.allSettled(promises);
      const failed = responses.filter(r => r.status === 'rejected').length;
      
      if (failed > 0) {
        console.log(`✅ Rate limiting working (${failed}/10 requests blocked)`);
        return true;
      } else {
        console.log('⚠️  Rate limiting not detected (all requests succeeded)');
        return false;
      }
    } catch (error) {
      console.log('❌ Rate limiting test failed:', error.message);
      return false;
    }
  }

  /**
   * Test 7: Invalid wallet address rejection
   */
  async testInvalidWalletRejection() {
    console.log('\n=== Test 7: Invalid Wallet Address Rejection ===');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/wallet/nonce`, {
        walletAddress: 'invalid-wallet-address'
      });

      console.log('❌ Invalid wallet should have been rejected');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid wallet address properly rejected');
        return true;
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  }

  /**
   * Test 8: Nonce expiration
   */
  async testNonceExpiration() {
    console.log('\n=== Test 8: Nonce Expiration ===');
    
    try {
      // Generate a nonce
      const nonceResponse = await axios.post(`${API_BASE_URL}/api/auth/wallet/nonce`, {
        walletAddress: this.testWalletAddress
      });

      const nonceData = nonceResponse.data.data;
      
      // Create an expired timestamp (older than 5 minutes)
      const expiredTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      const signature = this.signMessage(nonceData.message);
      
      // Try to use the nonce with an expired timestamp
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/wallet/verify`, {
        walletAddress: this.testWalletAddress,
        signature: signature,
        nonce: nonceData.nonce,
        timestamp: expiredTimestamp
      });

      console.log('❌ Expired nonce should have been rejected');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Expired nonce properly rejected');
        return true;
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting End-to-End Authentication Flow Tests');
    console.log('===================================================');
    
    const results = {};
    
    try {
      // Setup
      this.generateTestWallet();
      
      // Test 1: Nonce Generation
      const nonceData = await this.testNonceGeneration();
      results.nonceGeneration = true;
      
      // Test 2: Signature Verification (with separate nonce)
      const nonceData2 = await this.testNonceGeneration();
      results.signatureVerification = await this.testSignatureVerification(nonceData2);
      
      // Test 3: Wallet Connection (with separate nonce)
      const nonceData3 = await this.testNonceGeneration();
      const sessionData = await this.testWalletConnection(nonceData3);
      results.walletConnection = true;
      
      // Test 4: Wallet Status
      results.walletStatus = await this.testWalletStatus();
      
      // Test 5: Token Refresh
      results.tokenRefresh = await this.testTokenRefresh();
      
      // Test 6: Rate Limiting
      results.rateLimiting = await this.testRateLimiting();
      
      // Test 7: Invalid Wallet Rejection
      results.invalidWalletRejection = await this.testInvalidWalletRejection();
      
      // Test 8: Nonce Expiration
      results.nonceExpiration = await this.testNonceExpiration();
      
    } catch (error) {
      console.log('\n❌ Test suite failed:', error.message);
      results.error = error.message;
    }
    
    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).filter(k => k !== 'error').length;
    
    Object.entries(results).forEach(([test, result]) => {
      if (test !== 'error') {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
      }
    });
    
    console.log(`\n🏁 Overall: ${passed}/${total} tests passed`);
    
    if (results.error) {
      console.log(`❌ Error: ${results.error}`);
    }
    
    return results;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const tester = new AuthenticationE2ETest();
    await tester.runAllTests();
    process.exit(0);
  })();
}

module.exports = AuthenticationE2ETest; 