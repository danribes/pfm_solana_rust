// Task 7.1.3: Public User Registration & Wallet Connection
// Wallet connection guide component with step-by-step instructions

'use client';

import React, { useState } from 'react';
import { WalletProvider } from '@/types/registration';

interface WalletConnectionGuideProps {
  provider: WalletProvider;
  onBack?: () => void;
  onTryAgain?: () => void;
  className?: string;
}

// Step-by-step guides for each wallet
const walletGuides: Record<WalletProvider, {
  name: string;
  steps: Array<{
    title: string;
    description: string;
    image?: string;
    tips?: string[];
  }>;
  troubleshooting: Array<{
    issue: string;
    solution: string;
  }>;
}> = {
  phantom: {
    name: 'Phantom',
    steps: [
      {
        title: 'Install Phantom Wallet',
        description: 'Download and install the Phantom browser extension or mobile app.',
        tips: [
          'Available for Chrome, Firefox, and mobile devices',
          'Make sure to download from official sources only'
        ]
      },
      {
        title: 'Create or Import Wallet',
        description: 'Set up a new wallet or import an existing one using your seed phrase.',
        tips: [
          'Write down your seed phrase in a safe place',
          'Never share your seed phrase with anyone'
        ]
      },
      {
        title: 'Click Connect',
        description: 'Click the "Connect" button and approve the connection in the Phantom popup.',
        tips: [
          'Make sure Phantom is unlocked',
          'Check that you\'re on the correct network'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'Phantom not detected',
        solution: 'Refresh the page and make sure the Phantom extension is installed and enabled.'
      },
      {
        issue: 'Connection popup not appearing',
        solution: 'Check if popups are blocked in your browser settings and disable ad blockers temporarily.'
      },
      {
        issue: 'Wrong network',
        solution: 'Switch to Solana Mainnet in your Phantom settings.'
      }
    ]
  },
  solflare: {
    name: 'Solflare',
    steps: [
      {
        title: 'Install Solflare Wallet',
        description: 'Download and install the Solflare browser extension or mobile app.',
        tips: [
          'Available for Chrome, Firefox, and mobile devices',
          'Supports both Solana and Ethereum networks'
        ]
      },
      {
        title: 'Set Up Your Wallet',
        description: 'Create a new wallet or connect an existing one.',
        tips: [
          'Backup your recovery phrase securely',
          'Set a strong password for your wallet'
        ]
      },
      {
        title: 'Authorize Connection',
        description: 'Click "Connect" and approve the connection request in Solflare.',
        tips: [
          'Review the permissions being requested',
          'Ensure you\'re on the correct website'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'Solflare not responding',
        solution: 'Try refreshing the page or restarting your browser.'
      },
      {
        issue: 'Connection failed',
        solution: 'Make sure Solflare is unlocked and try connecting again.'
      }
    ]
  },
  metamask: {
    name: 'MetaMask',
    steps: [
      {
        title: 'Install MetaMask',
        description: 'Download and install the MetaMask browser extension or mobile app.',
        tips: [
          'Most popular Ethereum wallet',
          'Available for all major browsers'
        ]
      },
      {
        title: 'Create Your Account',
        description: 'Set up a new MetaMask account or import an existing one.',
        tips: [
          'Choose a strong password',
          'Store your seed phrase offline and securely'
        ]
      },
      {
        title: 'Connect to DApp',
        description: 'Click "Connect" and select your account in the MetaMask popup.',
        tips: [
          'MetaMask will ask for permission to view your account',
          'You can disconnect at any time from MetaMask settings'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'MetaMask not detected',
        solution: 'Ensure MetaMask is installed and enabled in your browser extensions.'
      },
      {
        issue: 'Wrong network',
        solution: 'Switch to the correct network (Ethereum Mainnet) in MetaMask.'
      },
      {
        issue: 'Transaction failed',
        solution: 'Check your gas settings and ensure you have enough ETH for gas fees.'
      }
    ]
  },
  walletconnect: {
    name: 'WalletConnect',
    steps: [
      {
        title: 'Choose WalletConnect',
        description: 'Select WalletConnect to connect with mobile wallets via QR code.',
        tips: [
          'Works with 100+ mobile wallets',
          'Secure connection via encrypted bridge'
        ]
      },
      {
        title: 'Scan QR Code',
        description: 'Open your mobile wallet app and scan the QR code that appears.',
        tips: [
          'Make sure your mobile wallet supports WalletConnect',
          'Keep your mobile device close to the screen'
        ]
      },
      {
        title: 'Approve Connection',
        description: 'Approve the connection request on your mobile device.',
        tips: [
          'Check the website URL carefully',
          'Review the permissions being requested'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'QR code not scanning',
        solution: 'Try adjusting screen brightness or scanning from a different angle.'
      },
      {
        issue: 'Connection timeout',
        solution: 'Generate a new QR code and try scanning again.'
      }
    ]
  },
  coinbase: {
    name: 'Coinbase Wallet',
    steps: [
      {
        title: 'Install Coinbase Wallet',
        description: 'Download the Coinbase Wallet browser extension or mobile app.',
        tips: [
          'Different from Coinbase exchange app',
          'Self-custody wallet for DeFi'
        ]
      },
      {
        title: 'Set Up Wallet',
        description: 'Create a new wallet or import an existing one.',
        tips: [
          'Coinbase Wallet is non-custodial',
          'You control your private keys'
        ]
      },
      {
        title: 'Connect to Site',
        description: 'Click "Connect" and approve the connection in Coinbase Wallet.',
        tips: [
          'Review the connection permissions',
          'Ensure you trust the website'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'Wallet not detected',
        solution: 'Make sure you have Coinbase Wallet (not Coinbase app) installed.'
      },
      {
        issue: 'Connection issues',
        solution: 'Try refreshing the page or clearing browser cache.'
      }
    ]
  },
  ledger: {
    name: 'Ledger',
    steps: [
      {
        title: 'Connect Ledger Device',
        description: 'Connect your Ledger hardware wallet to your computer via USB.',
        tips: [
          'Use the original USB cable provided',
          'Make sure device is charged'
        ]
      },
      {
        title: 'Open Ethereum App',
        description: 'Navigate to and open the Ethereum app on your Ledger device.',
        tips: [
          'Install the app via Ledger Live if not present',
          'Ensure firmware is up to date'
        ]
      },
      {
        title: 'Approve Connection',
        description: 'Follow the prompts on your Ledger device to authorize the connection.',
        tips: [
          'Check the address displayed matches',
          'Confirm by pressing both buttons'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'Device not detected',
        solution: 'Check USB connection and ensure Ledger Live is closed.'
      },
      {
        issue: 'App not opening',
        solution: 'Make sure the correct app is installed and device is unlocked.'
      }
    ]
  },
  trezor: {
    name: 'Trezor',
    steps: [
      {
        title: 'Connect Trezor Device',
        description: 'Connect your Trezor hardware wallet to your computer.',
        tips: [
          'Use official Trezor cable',
          'Ensure device is genuine'
        ]
      },
      {
        title: 'Enter PIN',
        description: 'Enter your PIN using the randomized number layout.',
        tips: [
          'PIN is displayed on Trezor screen',
          'Click corresponding positions on computer'
        ]
      },
      {
        title: 'Authorize Connection',
        description: 'Confirm the connection on your Trezor device.',
        tips: [
          'Verify the website URL on device',
          'Confirm by pressing the button'
        ]
      }
    ],
    troubleshooting: [
      {
        issue: 'Bridge not detected',
        solution: 'Install Trezor Bridge from the official website.'
      },
      {
        issue: 'Firmware outdated',
        solution: 'Update firmware using Trezor Suite.'
      }
    ]
  }
};

const WalletConnectionGuide: React.FC<WalletConnectionGuideProps> = ({
  provider,
  onBack,
  onTryAgain,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'troubleshooting'>('guide');
  
  const guide = walletGuides[provider];
  
  if (!guide) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connection Guide
          </h2>
          <p className="text-gray-600 mb-6">
            Guide not available for this wallet provider.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How to Connect {guide.name}
        </h2>
        <p className="text-gray-600">
          Follow these steps to securely connect your {guide.name} wallet
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'guide'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Connection Guide
        </button>
        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'troubleshooting'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Troubleshooting
        </button>
      </div>

      {/* Guide content */}
      {activeTab === 'guide' && (
        <div className="space-y-8">
          {guide.steps.map((step, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                {/* Step number */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  
                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-blue-800 font-medium mb-2">💡 Tips</h4>
                          <ul className="text-blue-700 text-sm space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Troubleshooting content */}
      {activeTab === 'troubleshooting' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-yellow-800 font-medium mb-2">Common Issues</h3>
                <p className="text-yellow-700 text-sm">
                  Having trouble connecting? Here are solutions to common problems.
                </p>
              </div>
            </div>
          </div>

          {guide.troubleshooting.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Problem: {item.issue}
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-green-800 font-medium mb-1">Solution:</h4>
                    <p className="text-green-700 text-sm">{item.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* General troubleshooting tips */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              General Troubleshooting Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">🔄 Basic Steps</h4>
                <ul className="space-y-1">
                  <li>• Refresh the page</li>
                  <li>• Clear browser cache</li>
                  <li>• Disable ad blockers</li>
                  <li>• Try incognito mode</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔒 Security Check</h4>
                <ul className="space-y-1">
                  <li>• Verify website URL</li>
                  <li>• Check SSL certificate</li>
                  <li>• Use official wallet sources</li>
                  <li>• Keep wallet updated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Wallet Selection
          </button>
        )}
        
        {onTryAgain && (
          <button
            onClick={onTryAgain}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Connecting Again
          </button>
        )}

        <a
          href={`https://help.${provider}.app`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
        >
          Official {guide.name} Help
        </a>
      </div>

      {/* Contact support */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm mb-2">
          Still having trouble?
        </p>
        <a
          href="/support"
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Contact our support team
        </a>
      </div>
    </div>
  );
};

export default WalletConnectionGuide; 