import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../WalletConnection';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
  requiresWallet?: boolean;
}

// Navigation icons (same as Sidebar)
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CommunitiesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const VotingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ResultsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HelpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { connected, shortAddress } = useWallet();

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      const handleRouteChange = () => onClose();
      router.events.on('routeChangeStart', handleRouteChange);
      return () => router.events.off('routeChangeStart', handleRouteChange);
    }
  }, [isOpen, onClose, router.events]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Main navigation items
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Your activity overview'
    },
    {
      name: 'Communities',
      href: '/communities',
      icon: CommunitiesIcon,
      description: 'Browse and join communities'
    },
    {
      name: 'Voting',
      href: '/voting-dashboard',
      icon: VotingIcon,
      badge: 3,
      description: 'Active votes',
      requiresWallet: true
    },
    {
      name: 'Results',
      href: '/results',
      icon: ResultsIcon,
      description: 'View voting results'
    },
    {
      name: 'Profile',
      href: '/profile/voting',
      icon: ProfileIcon,
      description: 'Manage your profile',
      requiresWallet: true
    }
  ];

  // Secondary navigation items
  const secondaryNavigation = [
    {
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
      description: 'App preferences'
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: HelpIcon,
      description: 'Get help and support'
    }
  ];

  const isCurrentPath = (href: string) => {
    if (href === '/dashboard' && (router.pathname === '/' || router.pathname === '/dashboard')) {
      return true;
    }
    return router.pathname.startsWith(href) && href !== '/dashboard';
  };

  const handleNavClick = (href: string, requiresWallet: boolean = false) => {
    if (requiresWallet && !connected) {
      return; // Don't navigate if wallet is required but not connected
    }
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Slide-out menu */}
      <div className={`
        fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🏠</span>
              <span className="ml-2 text-lg font-bold text-gray-900">PFM Member</span>
            </div>
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User section */}
          {connected && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {shortAddress?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{shortAddress}</p>
                  <p className="text-xs text-gray-500">Member</p>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">5</p>
                  <p className="text-xs text-gray-600">Communities</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">3</p>
                  <p className="text-xs text-gray-600">Active Votes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">8.4</p>
                  <p className="text-xs text-gray-600">Vote Power</p>
                </div>
              </div>
            </div>
          )}

          {/* Main navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = isCurrentPath(item.href);
                  const isDisabled = item.requiresWallet && !connected;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href, item.requiresWallet)}
                      disabled={isDisabled}
                      className={`
                        w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                        ${isActive
                          ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                          : isDisabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-3 flex-shrink-0 h-6 w-6
                          ${isActive
                            ? 'text-blue-600'
                            : isDisabled
                            ? 'text-gray-400'
                            : 'text-gray-400'
                          }
                        `}
                      />
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge && !isDisabled && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {item.badge}
                            </span>
                          )}
                          {isDisabled && (
                            <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                        <p className={`mt-1 text-xs ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary navigation */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                More
              </h3>
              <div className="mt-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = isCurrentPath(item.href);
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={`
                        w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                        ${isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1 text-left">
                        <span>{item.name}</span>
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            {!connected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Connect Wallet</h3>
                    <p className="mt-1 text-xs text-blue-700">
                      Connect your wallet to unlock all features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* System status */}
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>System Status</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Online
                </span>
              </div>
              
              {/* Container mode indicator */}
              {process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true' && (
                <div className="mt-2 flex items-center text-blue-600">
                  <span className="mr-1">🐳</span>
                  <span>Container Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu; 