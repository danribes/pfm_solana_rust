import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Redirect to dashboard - this is the main entry point
const AdminPortalHome: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Head>
        <title>PFM Admin Portal</title>
        <meta name="description" content="PFM Community Management Admin Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Admin Portal...</p>
      </div>
    </div>
  );
};

export default AdminPortalHome; 