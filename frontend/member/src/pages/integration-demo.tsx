// Frontend-Backend Integration Demo
// Task 5.1.1: Frontend-Backend Integration with Smart Contracts

import React, { useState, useEffect } from "react";
import { useIntegration } from "../hooks/useIntegration";
import { TransactionRequest, TransactionStatus } from "../types/integration";

const IntegrationDemo: React.FC = () => {
  const integration = useIntegration({
    autoConnect: true,
    enableDataSync: true,
    enableMetrics: true,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");

  // Load initial data
  useEffect(() => {
    if (integration.isConnected) {
      loadCommunities();
    }
  }, [integration.isConnected]);

  const loadCommunities = async () => {
    try {
      const response = await integration.getCommunities();
      if (response.success) {
        setCommunities(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load communities:", error);
    }
  };

  const loadProposals = async (communityId: string) => {
    try {
      const response = await integration.getProposals(communityId);
      if (response.success) {
        setProposals(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load proposals:", error);
    }
  };

  const handleCreateCommunity = async () => {
    const name = prompt("Enter community name:");
    if (!name) return;

    try {
      const response = await integration.createCommunity({
        name,
        description: `Community ${name} created via integration demo`,
        membershipFee: 100,
        governance: "democratic",
      });

      if (response.success) {
        alert("Community created successfully!");
        loadCommunities();
      }
    } catch (error) {
      alert(`Failed to create community: ${error.message}`);
    }
  };

  const handleCastVote = async (proposalId: string) => {
    const choice = prompt("Enter your vote (yes/no):");
    if (!choice || !["yes", "no"].includes(choice.toLowerCase())) {
      alert("Please enter yes or no");
      return;
    }

    try {
      const response = await integration.castVote(proposalId, {
        choice: choice.toLowerCase(),
        amount: 1,
        timestamp: Date.now(),
      });

      if (response.transactionId) {
        alert(`Vote cast successfully! Transaction ID: ${response.transactionId}`);
        
        // Track transaction
        const unsubscribe = integration.subscribeToTransaction(
          response.transactionId,
          (status) => {
            console.log(`Transaction ${response.transactionId} status: ${status}`);
            if (status === TransactionStatus.CONFIRMED) {
              loadProposals(selectedCommunity);
              unsubscribe();
            }
          }
        );
      }
    } catch (error) {
      alert(`Failed to cast vote: ${error.message}`);
    }
  };

  const handleTestTransaction = async () => {
    try {
      const transactionRequest: TransactionRequest = {
        id: `demo_tx_${Date.now()}`,
        instructions: [
          {
            programId: "11111111111111111111111111111112",
            keys: [
              { pubkey: integration.walletAddress!, isSigner: true, isWritable: true },
              { pubkey: "demo_recipient", isSigner: false, isWritable: true },
            ],
            data: "demo_transfer_data",
          },
        ],
        signers: [integration.walletAddress!],
        priority: "medium",
        metadata: {
          type: "demo_transfer",
          amount: 0.001,
          description: "Demo transaction from integration testing",
        },
      };

      const txId = await integration.submitTransaction(transactionRequest);
      alert(`Transaction submitted! ID: ${txId}`);

      // Add to history
      setTransactionHistory(prev => [
        {
          id: txId,
          type: "Demo Transfer",
          status: "Pending",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Subscribe to updates
      integration.subscribeToTransaction(txId, (status) => {
        setTransactionHistory(prev =>
          prev.map(tx =>
            tx.id === txId ? { ...tx, status: status.toUpperCase() } : tx
          )
        );
      });
    } catch (error) {
      alert(`Transaction failed: ${error.message}`);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                integration.isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>Overall Integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                integration.blockchainConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>Blockchain</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                integration.apiConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>API Backend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                integration.syncStatus === "idle" ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <span>Data Sync</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Address:</span>{" "}
            {integration.walletAddress || "Not connected"}
          </p>
          <p>
            <span className="font-medium">Pending Transactions:</span>{" "}
            {integration.pendingTransactions}
          </p>
          <p>
            <span className="font-medium">Last Sync:</span>{" "}
            {integration.lastSync
              ? new Date(integration.lastSync).toLocaleString()
              : "Never"}
          </p>
        </div>
      </div>

      {integration.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Errors</h3>
          {integration.errors.map((error, index) => (
            <div key={index} className="text-red-700 mb-2">
              <strong>{error.code}:</strong> {error.message}
            </div>
          ))}
          <button
            onClick={integration.clearErrors}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Errors
          </button>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transaction Management</h3>
        <button
          onClick={handleTestTransaction}
          disabled={!integration.isConnected}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Transaction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactionHistory.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No transactions yet. Try creating a test transaction!
                </td>
              </tr>
            ) : (
              transactionHistory.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tx.id.substring(0, 16)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tx.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : tx.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommunities = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Community Management</h3>
        <button
          onClick={handleCreateCommunity}
          disabled={!integration.isConnected}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Create Community
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((community) => (
          <div key={community.id} className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold mb-2">{community.name}</h4>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Members: {community.memberCount || 0}</p>
              <p>Governance: {community.governance || "Democratic"}</p>
              <p>Fee: {community.membershipFee || 0} tokens</p>
            </div>
            <button
              onClick={() => {
                setSelectedCommunity(community.id);
                loadProposals(community.id);
                setActiveTab("voting");
              }}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Proposals
            </button>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No communities found. Create one to get started!
        </div>
      )}
    </div>
  );

  const renderVoting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Voting Proposals
          {selectedCommunity && (
            <span className="text-sm text-gray-500 ml-2">
              (Community: {selectedCommunity})
            </span>
          )}
        </h3>
        {selectedCommunity && (
          <button
            onClick={() => loadProposals(selectedCommunity)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        )}
      </div>

      {!selectedCommunity ? (
        <div className="text-center py-8 text-gray-500">
          Select a community from the Communities tab to view proposals.
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-2">{proposal.title}</h4>
              <p className="text-gray-600 mb-4">{proposal.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Status: {proposal.status || "Active"}</p>
                  <p>
                    Votes: Yes {proposal.voteCount?.yes || 0}, No{" "}
                    {proposal.voteCount?.no || 0}
                  </p>
                </div>
                <button
                  onClick={() => handleCastVote(proposal.id)}
                  disabled={!integration.isConnected}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Cast Vote
                </button>
              </div>
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No proposals found for this community.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMetrics = () => {
    const metrics = integration.getMetrics();

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Blockchain Transactions
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {metrics.blockchain?.transactionCount || 0}
            </p>
            <p className="text-sm text-gray-500">
              Success Rate:{" "}
              {metrics.blockchain?.transactionCount > 0
                ? Math.round(
                    ((metrics.blockchain?.successfulTransactions || 0) /
                      metrics.blockchain.transactionCount) *
                      100
                  )
                : 0}
              %
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">API Requests</h4>
            <p className="text-2xl font-bold text-green-600">
              {metrics.api?.requestCount || 0}
            </p>
            <p className="text-sm text-gray-500">
              Success Rate:{" "}
              {metrics.api?.requestCount > 0
                ? Math.round(
                    ((metrics.api?.successCount || 0) / metrics.api.requestCount) * 100
                  )
                : 0}
              %
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Queue Length
            </h4>
            <p className="text-2xl font-bold text-yellow-600">
              {metrics.transactions?.queueLength || 0}
            </p>
            <p className="text-sm text-gray-500">
              Pending: {integration.pendingTransactions}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Cache Stats</h4>
            <p className="text-2xl font-bold text-purple-600">
              {metrics.dataSync?.totalKeys || 0}
            </p>
            <p className="text-sm text-gray-500">
              Stale: {metrics.dataSync?.staleKeys || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold mb-4">Detailed Metrics</h4>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Frontend-Backend Integration Demo
          </h1>
          <p className="text-gray-600">
            Task 5.1.1: Smart Contract Integration with PFM Community Management
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "transactions", label: "Transactions" },
              { id: "communities", label: "Communities" },
              { id: "voting", label: "Voting" },
              { id: "metrics", label: "Metrics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "transactions" && renderTransactions()}
          {activeTab === "communities" && renderCommunities()}
          {activeTab === "voting" && renderVoting()}
          {activeTab === "metrics" && renderMetrics()}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDemo;
