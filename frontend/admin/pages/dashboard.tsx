import React from 'react';
import Head from 'next/head';
import { WalletConnectionProvider } from '../../shared/components/WalletConnection';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import { AuthGuard } from '../../shared/components/AuthGuard';
import { AppLayout } from '../components/Layout';
import { DashboardOverview } from '../components/Dashboard';

const Dashboard: React.FC = () => {
  return (
    <>
      <Head>
        <title>Admin Dashboard - PFM Community Management</title>
        <meta 
          name="description" 
          content="Administrative dashboard for PFM community management platform" 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout 
        title="Admin Dashboard"
        description="Community Management Overview"
      >
        <DashboardOverview />
      </AppLayout>
    </>
  );
};

// Wrap the dashboard with authentication and wallet providers
const DashboardWithProviders: React.FC = () => {
  return (
    <WalletConnectionProvider
      network="devnet"
      autoConnect={true}
      onConnect={(publicKey) => {
        console.log('Wallet connected:', publicKey);
      }}
      onDisconnect={() => {
        console.log('Wallet disconnected');
      }}
      onError={(error) => {
        console.error('Wallet error:', error);
      }}
    >
      <AuthProvider>
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </AuthProvider>
    </WalletConnectionProvider>
  );
};

export default DashboardWithProviders; 