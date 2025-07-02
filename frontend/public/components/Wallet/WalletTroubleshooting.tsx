// Task 7.1.3: Public User Registration & Wallet Connection
// Wallet troubleshooting component for resolving connection issues

'use client';

import React, { useState, useEffect } from 'react';
import { WalletProvider } from '@/types/registration';

interface WalletTroubleshootingProps {
  provider?: WalletProvider;
  onBack?: () => void;
  onRetry?: () => void;
  className?: string;
}

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  solution?: string;
}

// Common troubleshooting solutions
const commonSolutions = {
  browserIssues: [
    {
      title: 'Clear Browser Cache',
      description: 'Clear your browser cache and cookies, then refresh the page.',
      steps: [
        'Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)',
        'Select "All time" as the time range',
        'Check "Cookies and other site data" and "Cached images and files"',
        'Click "Clear data"',
        'Refresh the page'
      ]
    },
    {
      title: 'Disable Ad Blockers',
      description: 'Ad blockers can interfere with wallet connections.',
      steps: [
        'Temporarily disable your ad blocker',
        'Add this site to your ad blocker\'s whitelist',
        'Refresh the page and try connecting again'
      ]
    },
    {
      title: 'Try Incognito Mode',
      description: 'Test if the issue persists in a private browsing window.',
      steps: [
        'Open an incognito/private window',
        'Navigate to this page',
        'Try connecting your wallet again'
      ]
    }
  ],
  walletIssues: [
    {
      title: 'Unlock Your Wallet',
      description: 'Make sure your wallet is unlocked and accessible.',
      steps: [
        'Open your wallet extension/app',
        'Enter your password to unlock',
        'Ensure you\'re logged in to the correct account'
      ]
    },
    {
      title: 'Check Network Settings',
      description: 'Verify you\'re connected to the correct blockchain network.',
      steps: [
        'Open your wallet settings',
        'Check the selected network',
        'Switch to the required network if necessary'
      ]
    },
    {
      title: 'Update Your Wallet',
      description: 'Ensure you\'re using the latest version of your wallet.',
      steps: [
        'Check for wallet updates in your browser extensions',
        'Update to the latest version if available',
        'Restart your browser after updating'
      ]
    }
  ],
  connectionIssues: [
    {
      title: 'Check Internet Connection',
      description: 'Ensure you have a stable internet connection.',
      steps: [
        'Test your internet connection',
        'Try switching networks (WiFi to mobile data)',
        'Restart your router if necessary'
      ]
    },
    {
      title: 'Firewall and Antivirus',
      description: 'Security software might block wallet connections.',
      steps: [
        'Temporarily disable your firewall',
        'Add wallet domains to antivirus whitelist',
        'Check if VPN is interfering'
      ]
    }
  ]
};

const WalletTroubleshooting: React.FC<WalletTroubleshootingProps> = ({
  provider,
  onBack,
  onRetry,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'solutions' | 'contact'>('diagnostic');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Run diagnostics
  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnostics([]);

    const results: DiagnosticResult[] = [];

    // Check browser compatibility
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push({
      check: 'Browser Compatibility',
      status: typeof window !== 'undefined' && (window as any).ethereum ? 'pass' : 'fail',
      message: typeof window !== 'undefined' && (window as any).ethereum 
        ? 'Browser supports Web3' 
        : 'Web3 not detected in browser',
      solution: 'Install a Web3 wallet extension like MetaMask or Phantom'
    });
    setDiagnostics([...results]);

    // Check wallet installation
    await new Promise(resolve => setTimeout(resolve, 500));
    if (provider) {
      let walletDetected = false;
      
      switch (provider) {
        case 'metamask':
          walletDetected = !!(window as any).ethereum?.isMetaMask;
          break;
        case 'phantom':
          walletDetected = !!(window as any).solana?.isPhantom;
          break;
        case 'solflare':
          walletDetected = !!(window as any).solflare;
          break;
        default:
          walletDetected = true; // Assume available for other wallets
      }

      results.push({
        check: `${provider} Installation`,
        status: walletDetected ? 'pass' : 'fail',
        message: walletDetected 
          ? `${provider} wallet detected` 
          : `${provider} wallet not detected`,
        solution: `Install ${provider} from official website`
      });
    } else {
      results.push({
        check: 'Wallet Installation',
        status: 'warning',
        message: 'No specific wallet selected for testing',
        solution: 'Select a wallet to test specific installation'
      });
    }
    setDiagnostics([...results]);

    // Check network connectivity
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const response = await fetch('https://api.github.com/status', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      results.push({
        check: 'Network Connectivity',
        status: 'pass',
        message: 'Internet connection is working',
      });
    } catch (error) {
      results.push({
        check: 'Network Connectivity',
        status: 'fail',
        message: 'Network connectivity issues detected',
        solution: 'Check your internet connection and try again'
      });
    }
    setDiagnostics([...results]);

    // Check popup blockers
    await new Promise(resolve => setTimeout(resolve, 500));
    const popupTest = window.open('', 'test', 'width=1,height=1');
    if (popupTest) {
      popupTest.close();
      results.push({
        check: 'Popup Blockers',
        status: 'pass',
        message: 'Popups are allowed',
      });
    } else {
      results.push({
        check: 'Popup Blockers',
        status: 'warning',
        message: 'Popup blocker detected',
        solution: 'Allow popups for this site in your browser settings'
      });
    }
    setDiagnostics([...results]);

    // Check localStorage
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({
        check: 'Browser Storage',
        status: 'pass',
        message: 'Local storage is working',
      });
    } catch (error) {
      results.push({
        check: 'Browser Storage',
        status: 'fail',
        message: 'Local storage is disabled',
        solution: 'Enable local storage in your browser settings'
      });
    }
    setDiagnostics([...results]);

    setIsRunningDiagnostics(false);
  };

  // Auto-run diagnostics on mount
  useEffect(() => {
    runDiagnostics();
  }, [provider]);

  const getSeverityColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getSeverityIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': 
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'fail':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wallet Connection Troubleshooting
        </h2>
        <p className="text-gray-600">
          {provider 
            ? `Resolve connection issues with ${provider}`
            : 'Diagnose and fix wallet connection problems'
          }
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'diagnostic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔍 Diagnostic
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'solutions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🛠️ Solutions
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'contact'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💬 Get Help
        </button>
      </div>

      {/* Diagnostic tab */}
      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Diagnostic
              </h3>
              <button
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunningDiagnostics ? 'Running...' : 'Run Diagnostic'}
              </button>
            </div>

            <div className="space-y-3">
              {diagnostics.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${getSeverityColor(result.status)}`}>
                        {getSeverityIcon(result.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{result.check}</h4>
                        <p className="text-gray-600 text-sm">{result.message}</p>
                        {result.solution && result.status !== 'pass' && (
                          <p className="text-blue-600 text-sm mt-1">
                            💡 {result.solution}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isRunningDiagnostics && diagnostics.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Running diagnostics...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Solutions tab */}
      {activeTab === 'solutions' && (
        <div className="space-y-8">
          {/* Browser Issues */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Browser Issues
            </h3>
            <div className="grid gap-4">
              {commonSolutions.browserIssues.map((solution, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-2">{solution.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{solution.description}</p>
                  <ol className="text-sm text-gray-700 space-y-1">
                    {solution.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start">
                        <span className="font-medium mr-2">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Issues */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👛 Wallet Issues
            </h3>
            <div className="grid gap-4">
              {commonSolutions.walletIssues.map((solution, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-2">{solution.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{solution.description}</p>
                  <ol className="text-sm text-gray-700 space-y-1">
                    {solution.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start">
                        <span className="font-medium mr-2">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Issues */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔗 Connection Issues
            </h3>
            <div className="grid gap-4">
              {commonSolutions.connectionIssues.map((solution, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-2">{solution.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{solution.description}</p>
                  <ol className="text-sm text-gray-700 space-y-1">
                    {solution.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start">
                        <span className="font-medium mr-2">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact tab */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Get Additional Help
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📖 Documentation</h4>
                <div className="space-y-2">
                  <a 
                    href="/docs/wallet-setup" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Wallet Setup Guide
                  </a>
                  <a 
                    href="/docs/troubleshooting" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Complete Troubleshooting Guide
                  </a>
                  <a 
                    href="/docs/faq" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Frequently Asked Questions
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">💬 Support Channels</h4>
                <div className="space-y-2">
                  <a 
                    href="/support/chat" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Live Chat Support
                  </a>
                  <a 
                    href="/support/ticket" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Submit Support Ticket
                  </a>
                  <a 
                    href="/community" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Community Forum
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                🕐 Support Hours
              </h4>
              <p className="text-blue-800 text-sm">
                Our support team is available Monday-Friday, 9AM-6PM PST. 
                We typically respond to tickets within 24 hours.
              </p>
            </div>
          </div>

          {/* Emergency help */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-900 font-semibold mb-2 flex items-center">
              🚨 Urgent Issues
            </h3>
            <p className="text-red-800 text-sm mb-3">
              If you're experiencing security issues or suspect unauthorized access:
            </p>
            <a 
              href="/security/report" 
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Report Security Issue
            </a>
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
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Connecting Again
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletTroubleshooting; 