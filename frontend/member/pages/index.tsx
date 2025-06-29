import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PFM Member Portal</h1>
            <p className="text-gray-600 mt-2">
              Welcome to your community management dashboard
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <p className="text-gray-600">
              Member portal is being loaded...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 