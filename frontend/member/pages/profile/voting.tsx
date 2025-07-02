import React from 'react';
import { WalletConnectionProvider } from '../../src/components/WalletConnection/WalletConnectionProvider';
import { AppLayout } from '../../src/components/Layout';
import VotingProfileManager from '../../components/Profile/VotingProfileManager';

const VotingProfilePage: React.FC = () => {
  // Mock user data - in real implementation, this would come from API/context
  const mockUser = {
    id: '1',
    profile: {
      personalInfo: {
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Active community member interested in governance and technology.',
        avatar: {
          id: '1',
          url: '/avatars/john.jpg',
          thumbnailUrl: '/avatars/john-thumb.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: '2024-01-01T00:00:00Z',
          isDefault: false,
          source: 'upload' as const
        },
        location: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          isPublic: true,
          precision: 'city' as const
        },
        dateOfBirth: '1990-01-01',
        timezone: 'UTC-8',
        languages: ['English', 'Spanish'],
        pronouns: 'he/him',
        website: 'https://johndoe.com',
        tagline: 'Building the future of decentralized communities'
      }
    },
    votingStats: {
      totalPolls: 15,
      totalVotes: 47,
      votingStreak: 12,
      longestStreak: 25,
      averageParticipation: 78.5,
      pollsCreated: 2,
      pollsWon: 28,
      accuracyScore: 73.2,
      engagementScore: 8.4,
      lastVotedAt: '2024-12-17T14:30:00Z',
      memberSince: '2024-01-15T00:00:00Z'
    },
    eligibilityStatus: {
      isEligible: true,
      verificationLevel: 'enhanced' as const,
      trustScore: 85,
      membershipTier: 'premium',
      membershipDuration: 337,
      restrictions: [],
      lastUpdated: '2024-12-18T00:00:00Z'
    },
    reputation: {
      overall: 850,
      breakdown: {
        participation: 92,
        consistency: 88,
        thoughtfulness: 76,
        leadership: 65
      },
      badges: [],
      level: 5,
      nextLevelThreshold: 1000,
      trend: 'rising' as const
    },
    achievements: [],
    preferences: {
      defaultVotePrivacy: 'public' as const,
      emailNotifications: true,
      pushNotifications: true,
      reminderFrequency: 'daily' as const,
      showResultsImmediately: true,
      preferredPollTypes: ['single_choice', 'multiple_choice'],
      blockedCategories: [],
      language: 'en',
      timezone: 'UTC-8'
    },
    privacy: {
      defaultVoteVisibility: 'public' as const,
      showVotingHistory: true,
      showStatistics: true,
      allowVoteTracking: true,
      shareDataForResearch: false,
      profileVisibility: 'public' as const
    },
    notifications: {
      pollStarted: true,
      pollReminder: true,
      pollEnding: true,
      resultsAvailable: true,
      newPollInCategory: true,
      achievementUnlocked: true,
      reputationChanged: false,
      systemUpdates: true,
      preferredDelivery: ['email', 'push'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    }
  };

  const handleSave = async (updates: any) => {
    console.log('Saving profile updates:', updates);
    // In real implementation, this would call an API
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Navigate back or show confirmation
    window.history.back();
  };

  return (
    <WalletConnectionProvider
      network="devnet"
      autoConnect={true}
      onConnect={(publicKey) => {
        console.log('Member wallet connected for profile:', publicKey);
      }}
      onDisconnect={() => {
        console.log('Member wallet disconnected');
      }}
      onError={(error) => {
        console.error('Member wallet error:', error);
      }}
    >
      <AppLayout 
        title="Voting Profile Settings"
        description="Manage your voting preferences and privacy settings"
      >
        <VotingProfileManager 
          user={mockUser as any}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </AppLayout>
    </WalletConnectionProvider>
  );
};

export default VotingProfilePage; 