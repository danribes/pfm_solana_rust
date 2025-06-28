import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, CalendarIcon, CloudArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import ReportGenerator from './ReportGenerator';
import ReportScheduler from './ReportScheduler';
import ReportHistory from './ReportHistory';
import ExportManager from './ExportManager';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ReportManagement: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs = [
    {
      name: 'Generate Report',
      icon: DocumentTextIcon,
      description: 'Create custom reports'
    },
    {
      name: 'Schedule Reports',
      icon: CalendarIcon,
      description: 'Automated reporting'
    },
    {
      name: 'Report History',
      icon: ClockIcon,
      description: 'View past reports'
    },
    {
      name: 'Export & Download',
      icon: CloudArrowDownIcon,
      description: 'Manage exports'
    }
  ];

  const renderTabContent = (index: number) => {
    switch (index) {
      case 0:
        return <ReportGenerator />;
      case 1:
        return <ReportScheduler />;
      case 2:
        return <ReportHistory />;
      case 3:
        return <ExportManager />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Reports & Export Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Generate custom reports, schedule automated reporting, and manage data exports
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Quick Report
            </button>
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

export default ReportManagement; 