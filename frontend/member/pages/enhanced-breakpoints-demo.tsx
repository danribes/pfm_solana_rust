import React, { useState } from 'react';
import { 
  useEnhancedResponsive, 
  useEnhancedBreakpoint, 
  useBreakpointRange,
  useDeviceTarget,
  useResponsiveValue,
  usePerformanceAwareResponsive
} from '../src/hooks/useEnhancedResponsive';

const EnhancedBreakpointsDemo: React.FC = () => {
  const enhancedState = useEnhancedResponsive();
  const performanceState = usePerformanceAwareResponsive();
  const [activeTab, setActiveTab] = useState('overview');

  // Responsive value demonstration
  const cardColumns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  });

  const headingSize = useResponsiveValue({
    mobile: 'text-xl',
    tablet: 'text-2xl', 
    desktop: 'text-3xl',
    large: 'text-4xl'
  });

  // Device targeting examples
  const isIPhone = useDeviceTarget('iPhone 12/13/14');
  const isIPad = useDeviceTarget('iPad');
  const isMacBook = useDeviceTarget('MacBook Air');

  // Breakpoint range examples
  const isSmallMobile = useBreakpointRange(320, 414);
  const isLargeMobile = useBreakpointRange(415, 767);
  const isSmallTablet = useBreakpointRange(768, 834);

  // Tab navigation with mobile-first design
  const TabButton: React.FC<{ 
    id: string; 
    label: string; 
    active: boolean 
  }> = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${enhancedState.isTouchDevice ? 'min-h-[44px]' : ''}
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );

  // Responsive container with enhanced spacing
  const ResponsiveContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerClass = enhancedState.isMobile ? 'px-4' : 
                          enhancedState.isTablet ? 'px-6' : 'px-8';
    return (
      <div className={`max-w-7xl mx-auto ${containerClass}`}>
        {children}
      </div>
    );
  };

  // Enhanced grid with precise breakpoint control
  const EnhancedGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const gridClass = `grid gap-${enhancedState.spacing.md} grid-cols-${cardColumns || 1}`;
    return <div className={gridClass}>{children}</div>;
  };

  // Sample data for grid demonstration
  const breakpointCards = [
    { title: 'Mobile XS', range: '320-374px', color: 'bg-red-500', devices: ['iPhone SE', 'Small Android'] },
    { title: 'Mobile SM', range: '375-414px', color: 'bg-orange-500', devices: ['iPhone 12', 'iPhone 13'] },
    { title: 'Mobile MD', range: '415-480px', color: 'bg-yellow-500', devices: ['Large phones', 'iPhone Pro Max'] },
    { title: 'Mobile LG', range: '481-767px', color: 'bg-green-500', devices: ['Landscape phones', 'Small tablets'] },
    { title: 'Tablet SM', range: '768-834px', color: 'bg-blue-500', devices: ['iPad Mini', 'Small tablets'] },
    { title: 'Tablet MD', range: '835-1024px', color: 'bg-indigo-500', devices: ['iPad', 'Medium tablets'] },
    { title: 'Desktop SM', range: '1024-1199px', color: 'bg-purple-500', devices: ['Small laptops', 'Netbooks'] },
    { title: 'Desktop MD', range: '1200-1439px', color: 'bg-pink-500', devices: ['Standard desktops', 'Laptops'] }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <ResponsiveContainer>
          <div className="py-6">
            <h1 className={`font-bold text-gray-900 ${headingSize}`}>
              Enhanced Responsive Breakpoints
            </h1>
            <p className={`text-gray-600 mt-2 ${enhancedState.isMobile ? 'text-sm' : 'text-base'}`}>
              Task 4.6.1 Sub-task 2: Advanced Breakpoint Management
            </p>
            
            {/* Performance indicators */}
            {performanceState.shouldReduceMotion && (
              <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
                ⚡ Reduced motion for performance
              </div>
            )}
            {performanceState.shouldOptimizeImages && (
              <div className="mt-2 ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block">
                🖼️ Image optimization active
              </div>
            )}
          </div>
        </ResponsiveContainer>
      </header>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <ResponsiveContainer>
          <div className="py-4">
            <div className={`flex ${enhancedState.isMobile ? 'flex-col space-y-2' : 'flex-row space-x-4'}`}>
              <TabButton id="overview" label="Overview" active={activeTab === 'overview'} />
              <TabButton id="device-targeting" label="Device Targeting" active={activeTab === 'device-targeting'} />
              <TabButton id="performance" label="Performance" active={activeTab === 'performance'} />
              <TabButton id="utilities" label="Utilities" active={activeTab === 'utilities'} />
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main content */}
      <main>
        <ResponsiveContainer>
          <div className="py-8 space-y-8">
            {/* Current device information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Enhanced Device Information</h2>
              <EnhancedGrid>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Device Category</div>
                  <div className="text-lg font-bold text-blue-900 capitalize">{enhancedState.deviceType}</div>
                  <div className="text-xs text-blue-700 mt-1">{enhancedState.deviceLabel}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Screen Resolution</div>
                  <div className="text-lg font-bold text-green-900">
                    {enhancedState.width} × {enhancedState.height}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Pixel Ratio: {enhancedState.pixelRatio}x
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Optimal Device</div>
                  <div className="text-lg font-bold text-purple-900">{enhancedState.optimalDevice}</div>
                  <div className="text-xs text-purple-700 mt-1 capitalize">
                    {enhancedState.orientation} • {enhancedState.colorScheme}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">Connection</div>
                  <div className="text-lg font-bold text-orange-900 capitalize">
                    {enhancedState.connectionType}
                  </div>
                  <div className="text-xs text-orange-700 mt-1">
                    Touch: {enhancedState.isTouchDevice ? 'Yes' : 'No'}
                  </div>
                </div>
              </EnhancedGrid>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Breakpoint System</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {breakpointCards.map((card, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className={`w-full h-3 ${card.color} rounded-t-lg mb-3`}></div>
                        <h4 className="font-semibold text-gray-900">{card.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{card.range}</p>
                        <div className="text-xs text-gray-500">
                          {card.devices.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakpoint Range Detection</h3>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isSmallMobile ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                      <span className="font-medium">Small Mobile (320-414px):</span> 
                      <span className={`ml-2 ${isSmallMobile ? 'text-green-700' : 'text-gray-500'}`}>
                        {isSmallMobile ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg ${isLargeMobile ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                      <span className="font-medium">Large Mobile (415-767px):</span>
                      <span className={`ml-2 ${isLargeMobile ? 'text-green-700' : 'text-gray-500'}`}>
                        {isLargeMobile ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg ${isSmallTablet ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                      <span className="font-medium">Small Tablet (768-834px):</span>
                      <span className={`ml-2 ${isSmallTablet ? 'text-green-700' : 'text-gray-500'}`}>
                        {isSmallTablet ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Device Targeting Tab */}
            {activeTab === 'device-targeting' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device-Specific Targeting</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${isIPhone ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <h4 className="font-medium text-gray-900">iPhone 12/13/14 Detection</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Target width: 390px | Current: {enhancedState.width}px
                    </p>
                    <div className={`mt-2 text-sm ${isIPhone ? 'text-green-700' : 'text-gray-500'}`}>
                      Status: {isIPhone ? '✅ Detected' : '❌ Not detected'}
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 ${isIPad ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <h4 className="font-medium text-gray-900">iPad Detection</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Target width: 820px | Current: {enhancedState.width}px
                    </p>
                    <div className={`mt-2 text-sm ${isIPad ? 'text-green-700' : 'text-gray-500'}`}>
                      Status: {isIPad ? '✅ Detected' : '❌ Not detected'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${isMacBook ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <h4 className="font-medium text-gray-900">MacBook Air Detection</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Target width: 1440px | Current: {enhancedState.width}px
                    </p>
                    <div className={`mt-2 text-sm ${isMacBook ? 'text-green-700' : 'text-gray-500'}`}>
                      Status: {isMacBook ? '✅ Detected' : '❌ Not detected'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance-Aware Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Connection Analysis</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Type:</strong> {enhancedState.connectionType}</p>
                        <p><strong>Optimize Images:</strong> {performanceState.shouldOptimizeImages ? 'Yes' : 'No'}</p>
                        <p><strong>Lazy Loading:</strong> {performanceState.shouldLazyLoad ? 'Active' : 'Disabled'}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Motion Preferences</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Reduce Motion:</strong> {performanceState.shouldReduceMotion ? 'Yes' : 'No'}</p>
                        <p><strong>Animation Safe:</strong> {!performanceState.shouldReduceMotion ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Memory Information</h4>
                      {enhancedState.memoryInfo ? (
                        <div className="text-sm space-y-1">
                          <p><strong>Used:</strong> {Math.round(enhancedState.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB</p>
                          <p><strong>Total:</strong> {Math.round(enhancedState.memoryInfo.totalJSHeapSize / 1024 / 1024)}MB</p>
                          <p><strong>Limit:</strong> {Math.round(enhancedState.memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Memory info not available</p>
                      )}
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Display Metrics</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Pixel Ratio:</strong> {enhancedState.pixelRatio}x</p>
                        <p><strong>Color Scheme:</strong> {enhancedState.colorScheme}</p>
                        <p><strong>Orientation:</strong> {enhancedState.orientation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Utilities Tab */}
            {activeTab === 'utilities' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsive Utilities</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Responsive Spacing</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      {Object.entries(enhancedState.spacing).map(([size, value]: [string, string]) => (
                        <div key={size} className="border rounded p-2 text-center">
                          <div className="font-medium">{size}</div>
                          <div className="text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Responsive Typography</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(enhancedState.typography).map(([size, value]: [string, string]) => (
                        <div key={size} className="border rounded p-2 text-center">
                          <div className="font-medium">{size}</div>
                          <div className="text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Grid Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded p-4">
                        <div className="font-medium text-gray-900">Columns</div>
                        <div className="text-lg font-bold text-blue-600">{enhancedState.grid.columns}</div>
                      </div>
                      <div className="border rounded p-4">
                        <div className="font-medium text-gray-900">Gutter</div>
                        <div className="text-lg font-bold text-green-600">{enhancedState.grid.gutter}</div>
                      </div>
                      <div className="border rounded p-4">
                        <div className="font-medium text-gray-900">Margin</div>
                        <div className="text-lg font-bold text-purple-600">{enhancedState.grid.margin}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    Task 4.6.1 Sub-task 2: Responsive Breakpoints ✅
                  </h3>
                  <p className="text-green-700">
                    Enhanced breakpoint system with device targeting and performance awareness
                  </p>
                  <div className="mt-2 text-sm text-green-600">
                    Features: Enhanced breakpoints, device targeting, performance optimization, responsive utilities
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default EnhancedBreakpointsDemo;
