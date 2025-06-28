import React from 'react';
import Head from 'next/head';
import { AppLayout } from '../components/Layout';

const TestPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test Page - PFM Admin Portal</title>
        <meta name="description" content="Test page for admin portal functionality" />
      </Head>

      <AppLayout 
        title="Test Page"
        description="Testing admin portal components"
      >
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Portal Test</h2>
            <p className="text-gray-600">
              This is a test page to verify that the admin portal layout and navigation are working correctly.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900">Layout</h3>
                <p className="text-sm text-blue-700 mt-1">✅ AppLayout component working</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-900">Navigation</h3>
                <p className="text-sm text-green-700 mt-1">✅ Sidebar navigation active</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-900">Styling</h3>
                <p className="text-sm text-purple-700 mt-1">✅ Tailwind CSS working</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800">Status</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Admin portal core components are functional. Dashboard issues related to wallet adapter dependencies.
            </p>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default TestPage; 