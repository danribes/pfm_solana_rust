import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import AppLayout from '../components/Layout/AppLayout';

const HomePage: React.FC = () => {
  const { connected } = useWalletContext();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to PFM Member Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover communities, participate in voting, and shape the future of decentralized governance
            </p>
            
            {!connected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Connect Your Wallet to Get Started
                </h3>
                <p className="text-blue-700">
                  Connect your Solana wallet to join communities and participate in voting
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">🏘️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Communities</h3>
                <p className="text-gray-600">
                  Browse and join communities that match your interests and values
                </p>
                <a 
                  href="/communities" 
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Explore Communities →
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">🗳️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Participate in Voting</h3>
                <p className="text-gray-600">
                  Have your voice heard by voting on important community decisions
                </p>
                <a 
                  href="/voting" 
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Active Votes →
                </a>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View Results</h3>
                <p className="text-gray-600">
                  Track voting outcomes and see how decisions impact communities
                </p>
                <a 
                  href="/results" 
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  See Results →
                </a>
              </div>
            </div>

            {connected && (
              <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Welcome back! 👋
                </h3>
                <p className="text-green-700">
                  Your wallet is connected and ready to participate in governance
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage; 