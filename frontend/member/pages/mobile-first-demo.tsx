import React, { useState } from 'react';
import { useResponsive } from '../src/hooks/useResponsive';
import ResponsiveContainer from '../src/components/Responsive/ResponsiveContainer';
import ResponsiveGrid from '../src/components/Responsive/ResponsiveGrid';
import MobileNavigation from '../src/components/Responsive/MobileNavigation';

const MobileFirstDemo: React.FC = () => {
  const { 
    deviceType, 
    isMobile, 
    isTablet, 
    isDesktop, 
    isTouchDevice, 
    width, 
    height, 
    orientation 
  } = useResponsive();

  const [activeSection, setActiveSection] = useState('overview');

  // Navigation items for mobile navigation demo
  const navigationItems = [
    {
      label: 'Overview',
      href: '#overview',
      active: activeSection === 'overview',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      label: 'Components',
      href: '#components',
      active: activeSection === 'components',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: 'Testing',
      href: '#testing',
      active: activeSection === 'testing',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Performance',
      href: '#performance',
      active: activeSection === 'performance',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  const handleNavigationClick = (item: any) => {
    setActiveSection(item.href.replace('#', ''));
  };

  // Sample data for responsive grid demonstration
  const sampleCards = [
    { title: 'Voting Results', content: 'Real-time voting visualization', color: 'bg-blue-500' },
    { title: 'Community Analytics', content: 'Member participation metrics', color: 'bg-green-500' },
    { title: 'Governance Proposals', content: 'Active community proposals', color: 'bg-purple-500' },
    { title: 'Member Dashboard', content: 'Personal activity overview', color: 'bg-orange-500' },
    { title: 'Notifications', content: 'Community updates and alerts', color: 'bg-red-500' },
    { title: 'Settings', content: 'Account and preferences', color: 'bg-gray-500' }
  ];

  // Touch-friendly button component demonstrating mobile-first design
  const TouchButton: React.FC<{ 
    children: React.ReactNode; 
    variant?: 'primary' | 'secondary'; 
    onClick?: () => void 
  }> = ({ children, variant = 'primary', onClick }) => (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-lg font-medium transition-colors
        ${isTouchDevice ? 'min-h-[44px] min-w-[44px]' : ''}
        ${variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with responsive navigation */}
      <header className="bg-white shadow-sm border-b">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Mobile-First Responsive Design
              </h1>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Task 4.6.1 Implementation Demo
              </p>
            </div>
            
            <MobileNavigation 
              items={navigationItems}
              onItemClick={handleNavigationClick}
            />
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main content area */}
      <main>
        <ResponsiveContainer padding="large">
          {/* Device information display */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Device Information</h2>
            <ResponsiveGrid 
              cols={{ mobile: 1, tablet: 2, desktop: 3, large: 4 }}
              gap="medium"
            >
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Device Type</div>
                <div className="text-lg font-bold text-blue-900 capitalize">{deviceType}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Screen Size</div>
                <div className="text-lg font-bold text-green-900">{width} × {height}px</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Orientation</div>
                <div className="text-lg font-bold text-purple-900 capitalize">{orientation}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Touch Device</div>
                <div className="text-lg font-bold text-orange-900">{isTouchDevice ? 'Yes' : 'No'}</div>
              </div>
            </ResponsiveGrid>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile-First Approach</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Progressive Enhancement</h3>
                      <p className="text-gray-600">Starts with mobile design and enhances for larger screens</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Touch-Friendly Interface</h3>
                      <p className="text-gray-600">Minimum 44px touch targets for accessibility</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Responsive Breakpoints</h3>
                      <p className="text-gray-600">Mobile (≤767px), Tablet (768-1023px), Desktop (≥1024px)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsive grid showcase */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Responsive Grid System</h2>
                <ResponsiveGrid 
                  cols={{ mobile: 1, tablet: 2, desktop: 3, large: 3 }}
                  gap="medium"
                >
                  {sampleCards.map((card, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className={`w-full h-3 ${card.color} rounded-t-lg mb-3`}></div>
                      <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-gray-600 text-sm">{card.content}</p>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>
            </div>
          )}

          {/* Touch interface testing */}
          {activeSection === 'testing' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Touch Interface Testing</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Touch Target Sizes</h3>
                    <div className="flex flex-wrap gap-4">
                      <TouchButton variant="primary">Primary Button</TouchButton>
                      <TouchButton variant="secondary">Secondary Button</TouchButton>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Buttons automatically meet 44px minimum for touch devices
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Responsive Behavior Test</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Current View:</strong> {deviceType} layout active
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Navigation:</strong> {isMobile ? 'Hamburger menu' : 'Horizontal navigation'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Grid Columns:</strong> {isMobile ? '1 column' : isTablet ? '2 columns' : '3+ columns'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task 4.6.1 Sub-task 1 Status */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-900">Task 4.6.1: Mobile-First Layout Design ✅</h3>
                <p className="text-green-700">
                  Mobile-first responsive design implemented with progressive enhancement
                </p>
                <div className="mt-2 text-sm text-green-600">
                  Features: Responsive hooks, containers, grids, mobile navigation, touch optimization
                </div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default MobileFirstDemo;
