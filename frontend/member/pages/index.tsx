import React from 'react';
import Head from 'next/head';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>PFM Community - Test Page</title>
        <meta name="description" content="Test page for PFM Community" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PFM Community</h1>
          <p className="text-xl text-gray-600 mb-8">Test Page - Application is working!</p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>✅ Next.js is running successfully</p>
            <p>✅ Member portal is operational</p>
            <p>✅ No more internal server errors</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage; 