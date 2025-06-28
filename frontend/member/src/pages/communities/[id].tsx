import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import AppLayout from '../../components/Layout/AppLayout';
import CommunityDetail from '../../components/Communities/CommunityDetail';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useCommunityDetails } from '../../hooks/useCommunities';

const CommunityDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const communityId = Array.isArray(id) ? id[0] : id;

  const { community, loading, error } = useCommunityDetails(communityId || '');

  if (!communityId) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Invalid Community</h2>
            <p className="text-gray-500 mt-2">Community ID not provided</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Community</h2>
            <p className="text-gray-500 mt-2">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!community) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Community Not Found</h2>
            <p className="text-gray-500 mt-2">The requested community could not be found</p>
            <button
              onClick={() => router.push('/communities')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
            >
              Browse Communities
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{community.name} - PFM Community</title>
        <meta name="description" content={community.description} />
        <meta property="og:title" content={`${community.name} - PFM Community`} />
        <meta property="og:description" content={community.description} />
        <meta property="og:type" content="website" />
      </Head>
      
      <AppLayout>
        <CommunityDetail community={community} />
      </AppLayout>
    </>
  );
};

export default CommunityDetailPage; 