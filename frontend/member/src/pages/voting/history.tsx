import React from "react";
import AppLayout from "../../components/Layout/AppLayout";
import VotingHistory from "../../components/Voting/VotingHistory";
import { useWallet } from "../../hooks/useWallet";

const VotingHistoryPage: React.FC = () => {
  const { connected } = useWallet();

  return (
    <AppLayout
      title="Voting History"
      description="View your complete voting history and participation statistics"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting History</h1>
              <p className="text-gray-600">
                Track your voting participation and view past decisions
              </p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/voting"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Active Votes
              </a>
            </div>
          </div>
        </div>

        {!connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-1">Wallet Not Connected</h3>
            <p className="text-yellow-700">
              Connect your wallet to view your personal voting history and statistics.
            </p>
          </div>
        )}

        {connected ? (
          <VotingHistory pageSize={20} />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet to View History</h3>
            <p className="text-gray-600">
              Your voting history is tied to your wallet address.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VotingHistoryPage;
