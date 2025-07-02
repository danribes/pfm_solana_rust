import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to voting dashboard as the main interface
    router.push('/voting-dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900">Loading Voting Community...</h1>
        <p className="text-gray-600 mt-2">Redirecting to your dashboard</p>
      </div>
    </div>
  );
};

export default HomePage; 