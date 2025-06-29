import React from 'react';

const VotingHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voting History</h1>
            <p className="text-gray-600 mt-2">
              View your past votes and voting statistics
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Past Votes</h2>
            <p className="text-gray-600">
              Voting history is being loaded...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingHistoryPage; 