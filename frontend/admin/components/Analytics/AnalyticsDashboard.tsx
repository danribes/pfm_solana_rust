import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CalendarIcon, DocumentChartBarIcon, UsersIcon, BuildingOfficeIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import DateRangeFilter from './DateRangeFilter';
import CommunityAnalyticsDashboard from './Dashboards/CommunityAnalyticsDashboard';
import VotingAnalyticsDashboard from './Dashboards/VotingAnalyticsDashboard';
import UserAnalyticsDashboard from './Dashboards/UserAnalyticsDashboard';
import SystemHealthDashboard from './Dashboards/SystemHealthDashboard';
import ReportManagement from './Reports/ReportManagement';
import { AnalyticsFilters } from '../../types/analytics';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AnalyticsDashboard: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const tabs = [
    {
      name: 'Overview',
      icon: ChartBarIcon,
      description: 'Key metrics and system overview'
    },
    {
      name: 'Communities',
      icon: BuildingOfficeIcon,
      description: 'Community growth and engagement'
    },
    {
      name: 'Voting',
      icon: DocumentChartBarIcon,
      description: 'Voting participation and results'
    },
    {
      name: 'Users',
      icon: UsersIcon,
      description: 'User activity and demographics'
    },
    {
      name: 'System Health',
      icon: Cog6ToothIcon,
      description: 'Performance and system metrics'
    },
    {
      name: 'Reports',
      icon: CalendarIcon,
      description: 'Generate and manage reports'
    }
  ];

  const handleDateRangeChange = (newRange: AnalyticsFilters) => {
    setDateRange(newRange);
  };

  const renderTabContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Overview combines key metrics from all areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Community Summary</h3>
                <CommunityAnalyticsDashboard filters={dateRange} compact={true} />
              </div>
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <SystemHealthDashboard filters={dateRange} compact={true} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Voting Activity</h3>
                <VotingAnalyticsDashboard filters={dateRange} compact={true} />
              </div>
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement</h3>
                <UserAnalyticsDashboard filters={dateRange} compact={true} />
              </div>
            </div>
          </div>
        );
      case 1:
        return <CommunityAnalyticsDashboard filters={dateRange} />;
      case 2:
        return <VotingAnalyticsDashboard filters={dateRange} />;
      case 3:
        return <UserAnalyticsDashboard filters={dateRange} />;
      case 4:
        return <SystemHealthDashboard filters={dateRange} />;
      case 5:
        return <ReportManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Analytics Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              View comprehensive analytics and generate reports for your communities
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
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
                      'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:text-indigo-600 focus:border-indigo-500'
                    )
                  }
                >
                  <tab.icon
                    className={classNames(
                      selectedIndex === index ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                      '-ml-0.5 mr-2 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col items-start">
                    <span>{tab.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{tab.description}</span>
                  </div>
                </Tab>
              ))}
            </nav>
          </Tab.List>
          
          <Tab.Panels>
            {tabs.map((_, index) => (
              <Tab.Panel key={index} className="p-6">
                {renderTabContent(index)}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
};

export default AnalyticsDashboard; 