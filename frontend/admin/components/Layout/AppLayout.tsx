import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import Header from './Header';
import Sidebar from '../Navigation/Sidebar';
import MobileMenu from '../Navigation/MobileMenu';

const inter = Inter({ subsets: ['latin'] });

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = 'PFM Admin Portal',
  description = 'Community Management Administration'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`${inter.className} min-h-screen bg-gray-50`}>
      {/* Mobile menu overlay */}
      <MobileMenu 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header 
          onMobileMenuToggle={() => setSidebarOpen(true)}
          title={title}
          description={description}
        />

        {/* Main content */}
        <main className="flex-1 pb-8">
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
              <div className="py-6 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <div>
                      <div className="flex items-center">
                        <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                          {title}
                        </h1>
                      </div>
                      <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                        <dt className="sr-only">Account status</dt>
                        <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                          <div className="flex-shrink-0 mr-1.5 h-2.5 w-2.5 rounded-full bg-green-400" />
                          {description}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="mt-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 