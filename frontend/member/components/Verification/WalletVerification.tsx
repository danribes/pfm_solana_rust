// Task 7.2.3: User Profile Creation & Management
// Wallet verification component

'use client';

import React, { useState } from 'react';
import { useVerification } from '../../../shared/hooks/useProfile';
import { WalletVerification as WalletVerificationType } from '../../../shared/types/profile';

interface WalletVerificationProps {
  userId: string;
  onVerificationComplete?: (verification: WalletVerificationType) => void;
}

export default function WalletVerification({ userId, onVerificationComplete }: WalletVerificationProps) {
  const { verificationStatus, isLoading, actions } = useVerification(userId);
  const [walletAddress, setWalletAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyWallet = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // Mock signature for demo purposes
      const signature = `mock-signature-${Date.now()}`;
      
      const verification = await actions.verifyWallet(walletAddress, signature);
      
      if (onVerificationComplete) {
        onVerificationComplete(verification);
      }
      
      setWalletAddress('');
    } catch (err) {
      setError('Failed to verify wallet. Please try again.');
      console.error('Wallet verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const verifiedWallets = verificationStatus?.wallet || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Verification</h3>
      
      {/* Verified Wallets */}
      {verifiedWallets.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Verified Wallets</h4>
          <div className="space-y-2">
            {verifiedWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    {wallet.isPrimary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Verified {new Date(wallet.verifiedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-green-600 font-medium">{wallet.chain}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Wallet */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Wallet</h4>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
              disabled={verifying}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerifyWallet}
            disabled={verifying || !walletAddress.trim()}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Wallet'
            )}
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">How it works:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter your wallet address</li>
            <li>• Sign a verification message (coming soon)</li>
            <li>• Your wallet will be verified and linked to your profile</li>
            <li>• Verified wallets increase your trust score</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 