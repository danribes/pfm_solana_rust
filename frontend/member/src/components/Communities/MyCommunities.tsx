import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useMyCommunitiesData } from '../../hooks/useCommunities';
import CommunityCard from './CommunityCard';
import LoadingSpinner from '../UI/LoadingSpinner';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const MyCommunities: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { communities, pendingRequests, loading, error } = useMyCommunitiesData();

  const tabs = [
    {
      name: 'My Communities',
      count: communities?.length || 0,
      content: communities
    },
    {
      name: 'Pending Requests',
      count: pendingRequests?.length || 0,
      content: pendingRequests
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error loading communities: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Communities</h2>
        <p className="text-gray-600 mt-1">Manage your community memberships and requests</p>
      </div>

      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className="bg-white shadow-sm rounded-lg">
          <Tab.List className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none'
                    )
                  }
                >
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </Tab>
              ))}
            </nav>
          </Tab.List>
          
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel key={index} className="p-6">
                {tab.content && tab.content.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tab.content.map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        variant="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      {index === 0 
                        ? "You haven't joined any communities yet"
                        : "No pending requests"
                      }
                    </div>
                  </div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
};

export default MyCommunities; 