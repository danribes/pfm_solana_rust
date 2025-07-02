import React from 'react';
import Head from 'next/head';
import { AppLayout } from '../src/components/Layout';

const HelpPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Help & Support - PFM Member Portal</title>
        <meta name="description" content="Get help and support for the PFM community platform" />
      </Head>

      <AppLayout title="Help & Support" description="Get help and support">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🗳️ Voting Help</h2>
                <p className="text-gray-600">
                  Learn how to participate in community votes and manage your voting preferences.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🔗 Wallet Connection</h2>
                <p className="text-gray-600">
                  Get help connecting your wallet and troubleshooting connection issues.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">👥 Community Features</h2>
                <p className="text-gray-600">
                  Discover how to join communities and participate in governance.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">📞 Contact Support</h2>
                <p className="text-gray-600">
                  Need additional help? Contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default HelpPage; 