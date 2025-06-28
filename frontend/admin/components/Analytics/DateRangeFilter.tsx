import React, { useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AnalyticsFilters } from '../../types/analytics';

interface DateRangeFilterProps {
  value: AnalyticsFilters;
  onChange: (range: AnalyticsFilters) => void;
}

interface DatePreset {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('30d');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const datePresets: DatePreset[] = [
    {
      label: 'Last 7 days',
      value: '7d',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'Last 30 days',
      value: '30d',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'Last 90 days',
      value: '90d',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'Last 6 months',
      value: '6m',
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'Last year',
      value: '1y',
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      label: 'This month',
      value: 'this_month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    },
    {
      label: 'Last month',
      value: 'last_month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    }
  ];

  const getCurrentPresetLabel = () => {
    const preset = datePresets.find(p => p.value === selectedPreset);
    return preset ? preset.label : 'Custom range';
  };

  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset.value);
    setShowCustom(false);
    onChange({
      startDate: preset.startDate.toISOString(),
      endDate: preset.endDate.toISOString(),
    });
  };

  const handleCustomRange = () => {
    setShowCustom(true);
    setSelectedPreset('custom');
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      
      if (start <= end) {
        onChange({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });
        setShowCustom(false);
      }
    }
  };

  const formatDateRange = () => {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
    };
    
    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Date Range Display */}
      <div className="flex items-center text-sm text-gray-600">
        <CalendarIcon className="h-4 w-4 mr-1" />
        <span>{formatDateRange()}</span>
      </div>

      {/* Preset Selector */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {getCurrentPresetLabel()}
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              {datePresets.map((preset) => (
                <Menu.Item key={preset.value}>
                  {({ active }) => (
                    <button
                      onClick={() => handlePresetSelect(preset)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        selectedPreset === preset.value ? 'bg-indigo-50 text-indigo-700' : ''
                      } group flex items-center px-4 py-2 text-sm w-full text-left`}
                    >
                      {preset.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
              
              <div className="border-t border-gray-100 my-1" />
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleCustomRange}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      selectedPreset === 'custom' ? 'bg-indigo-50 text-indigo-700' : ''
                    } group flex items-center px-4 py-2 text-sm w-full text-left`}
                  >
                    Custom range...
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Custom Date Range Modal */}
      {showCustom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Date Range</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCustom(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter; 