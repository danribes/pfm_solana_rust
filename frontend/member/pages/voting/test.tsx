import React from "react";
import AppLayout from "../src/components/Layout/AppLayout";

const VotingTestPage: React.FC = () => {
  return (
    <AppLayout
      title="Voting Test"
      description="Simple test page to verify voting routes work"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting Test Page</h1>
          <p className="text-gray-600">
            This is a simple test page to verify that voting routes are working correctly.
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Test Success!</h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, it means the voting routes are correctly configured and TypeScript is compiling.
          </p>
          <div className="space-x-4">
            <a
              href="/voting"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Voting
            </a>
            <a
              href="/voting/history"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go to History
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VotingTestPage;
