import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/Layout/AppLayout';
import PendingApprovalQueue from '../../components/Members/PendingApprovalQueue';
import MemberList from '../../components/Members/MemberList';
import MemberAnalytics from '../../components/Members/MemberAnalytics';

const MembersPage: React.FC = () => {
  const router = useRouter();
  const { communityId } = router.query;
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'analytics'>('all');

  // For demo purposes, using a mock community ID if not provided
  const currentCommunityId = (communityId as string) || 'demo-community-id';

  const tabs = [
    { id: 'all', name: 'All Members', icon: '👥' },
    { id: 'pending', name: 'Pending Approvals', icon: '⏳' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Member Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage community members, approve applications, and view analytics
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                📤 Export Members
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                + Invite Members
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'all' && (
            <MemberList communityId={currentCommunityId} />
          )}
          
          {activeTab === 'pending' && (
            <PendingApprovalQueue communityId={currentCommunityId} />
          )}
          
          {activeTab === 'analytics' && (
            <MemberAnalytics communityId={currentCommunityId} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MembersPage; 