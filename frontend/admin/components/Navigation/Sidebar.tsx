import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    description: 'Overview and key metrics'
  },
  { 
    name: 'Communities', 
    href: '/communities', 
    icon: BuildingOfficeIcon, 
    iconSolid: BuildingOfficeIconSolid,
    description: 'Manage communities and settings'
  },
  { 
    name: 'Members', 
    href: '/members', 
    icon: UsersIcon, 
    iconSolid: UsersIconSolid,
    description: 'Member approval and management'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon, 
    iconSolid: ChartBarIconSolid,
    description: 'Reports and insights'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon, 
    iconSolid: Cog6ToothIconSolid,
    description: 'System configuration'
  },
];

const secondaryNavigation = [
  { name: 'Help & Support', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Documentation', href: '/docs', icon: DocumentTextIcon },
  { name: 'System Status', href: '/status', icon: BellIcon },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return router.pathname === '/' || router.pathname === '/dashboard';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
      {/* Logo and brand */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PFM</span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">Admin Portal</div>
            <div className="text-xs text-gray-500">Community Management</div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isCurrentPage = isActive(item.href);
                const Icon = isCurrentPage ? item.iconSolid : item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-150 ${
                        isCurrentPage
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 shrink-0 ${
                          isCurrentPage ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className={`text-xs ${
                          isCurrentPage ? 'text-indigo-500' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Secondary navigation */}
          <li className="mt-auto">
            <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
              Support
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <item.icon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 