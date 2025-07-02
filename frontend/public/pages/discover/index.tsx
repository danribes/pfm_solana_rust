// Task 7.1.2: Community Discovery & Browse Interface
// Main discovery page

'use client';

import React from 'react';
import Head from 'next/head';
import { Community } from '@/types/communityDiscovery';
import CommunityDirectory from '@/components/Discovery/CommunityDirectory';

const DiscoverPage: React.FC = () => {
  // Handle community selection
  const handleCommunitySelect = (community: Community) => {
    // Navigate to community preview page
    window.location.href = `/communities/${community.id}/preview`;
  };

  // Handle join community
  const handleJoinCommunity = async (communityId: string) => {
    try {
      // In a real app, this would make an API call
      console.log('Joining community:', communityId);
      
      // Navigate to join confirmation or member dashboard
      window.location.href = `/communities/${communityId}/join`;
    } catch (error) {
      console.error('Failed to join community:', error);
      // Show error notification
    }
  };

  return (
    <>
      <Head>
        <title>Discover Communities | PFM Platform</title>
        <meta 
          name="description" 
          content="Discover and join communities that align with your interests. Participate in democratic decision-making and help shape the future through blockchain-powered voting."
        />
        <meta name="keywords" content="communities, governance, voting, blockchain, DAO, democracy" />
        <meta property="og:title" content="Discover Communities | PFM Platform" />
        <meta 
          property="og:description" 
          content="Find communities that match your interests and values. Join the future of democratic decision-making."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/discover" />
      </Head>

      <main className="min-h-screen">
        <CommunityDirectory
          showFilters={true}
          showStats={true}
          onCommunitySelect={handleCommunitySelect}
          onJoinCommunity={handleJoinCommunity}
        />
      </main>
    </>
  );
};

export default DiscoverPage; 