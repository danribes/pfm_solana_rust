import React from 'react';
import Head from 'next/head';
import { WalletConnectionProvider } from '../src/components/WalletConnection';
import { AppLayout } from '../src/components/Layout';
import DashboardOverview from '../src/components/Dashboard/DashboardOverview';

const MemberDashboard: React.FC = () => {
  return (
    <WalletConnectionProvider
      network="devnet"
      autoConnect={true}
      onConnect={(publicKey) => {
        console.log('Member wallet connected:', publicKey);
      }}
      onDisconnect={() => {
        console.log('Member wallet disconnected');
      }}
      onError={(error) => {
        console.error('Member wallet error:', error);
      }}
    >
      <AppLayout 
        title="Dashboard"
        description="Your community activity overview and quick access to member features"
      >
        <div className="space-y-6">
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay up to date with your communities and voting activities
              </p>
            </div>
          </div>

          {/* Dashboard Content */}
          <DashboardOverview />
        </div>
      </AppLayout>
    </WalletConnectionProvider>
  );
};

export default MemberDashboard; 