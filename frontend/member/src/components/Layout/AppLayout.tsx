import React, { useState } from 'react';
import Head from 'next/head';
import Header from './Header';
import Sidebar from '../Navigation/Sidebar';
import MobileMenu from '../Navigation/MobileMenu';
import { useWallet } from '../WalletConnection';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = 'Member Portal',
  description = 'PFM Community Management Member Portal',
  showSidebar = true,
  className = ''
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connected } = useWallet();

  // Generate page title
  const pageTitle = title === 'Member Portal' 
    ? 'PFM Member Portal'
    : `${title} - PFM Member Portal`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Progressive Web App meta tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PFM Member" />
        
        {/* Container-aware meta tags */}
        <meta name="container-mode" content={process.env.NEXT_PUBLIC_CONTAINER_MODE || 'false'} />
        <meta name="service-type" content="member-portal" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile menu */}
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        {/* Desktop sidebar */}
        {showSidebar && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <div className={`${showSidebar ? 'lg:pl-64' : ''}`}>
          {/* Header */}
          <Header 
            onMobileMenuClick={() => setMobileMenuOpen(true)}
            showMobileMenuButton={showSidebar}
          />

          {/* Page content */}
          <main className={`flex-1 ${className}`}>
            {/* Not connected warning for protected areas */}
            {!connected && title !== 'Welcome' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please connect your wallet to access member features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content container */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-4 py-2">
            <a 
              href="/dashboard"
              className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-blue-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <a 
              href="/communities"
              className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-blue-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Browse</span>
            </a>
            <a 
              href="/voting"
              className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-blue-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Vote</span>
            </a>
            <a 
              href="/profile"
              className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-blue-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
          </div>
        </div>

        {/* Container development indicator */}
        {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true' && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg z-50">
            🐳 Container Mode
          </div>
        )}
      </div>
    </>
  );
};

export default AppLayout; 