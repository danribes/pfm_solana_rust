// Simple Admin Portal Home Page
import React from 'react';

const AdminHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PFM Admin Portal</h1>
              <p className="text-gray-600 mt-2">Community Management Administration</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">✅ Container Running</div>
              <div className="text-xs text-gray-500">Port: 3001</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Container Status</p>
                <p className="text-2xl font-bold text-green-600">Running</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                🟢
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Portal</p>
                <p className="text-2xl font-bold text-blue-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                👨‍💼
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Environment</p>
                <p className="text-2xl font-bold text-purple-600">Docker</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                🐳
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Admin Features</h2>
            <p className="text-gray-600 text-sm mt-1">Community management and administration tools</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage community members and permissions</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🗳️</div>
                <h3 className="font-semibold text-gray-900">Voting Oversight</h3>
                <p className="text-sm text-gray-600 mt-1">Monitor and manage voting processes</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1">Community engagement and performance metrics</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏘️</div>
                <h3 className="font-semibold text-gray-900">Community Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Configure community parameters and rules</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold text-gray-900">System Configuration</h3>
                <p className="text-sm text-gray-600 mt-1">Platform settings and integration management</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900">Reports & Insights</h3>
                <p className="text-sm text-gray-600 mt-1">Generate reports and export data</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Admin Portal</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Container Environment</span>
                </div>
                <span className="text-blue-600 text-sm font-medium">Running</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Backend Services</span>
                </div>
                <span className="text-yellow-600 text-sm font-medium">Demo Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-400 text-xl mr-3">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Admin Portal - Demo Mode</h3>
              <p className="text-blue-700 text-sm mt-1">
                The admin portal is running successfully in containerized environment. 
                Backend services are configured for demo mode with mock data and simulated functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
