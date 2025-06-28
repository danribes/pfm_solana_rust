import React from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  UserPlusIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  badge?: string | number;
  external?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  href,
  icon: Icon,
  color,
  badge,
  external = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
    red: 'text-red-600 bg-red-50 hover:bg-red-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
  };

  const Component = external ? 'a' : Link;
  const linkProps = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };

  return (
    <Component {...linkProps}>
      <div className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-200">
        <div>
          <span className={`rounded-lg inline-flex p-3 ${colorClasses[color]} group-hover:text-white transition-colors duration-200`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          {badge && (
            <span className="absolute -top-2 -right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
            <span className="absolute inset-0" aria-hidden="true" />
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        </div>
        <span
          className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
          aria-hidden="true"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
          </svg>
        </span>
      </div>
    </Component>
  );
};

const QuickActions: React.FC = () => {
  const actions: QuickActionProps[] = [
    {
      title: 'Create Community',
      description: 'Set up a new community with custom rules and settings',
      href: '/communities/create',
      icon: PlusIcon,
      color: 'blue'
    },
    {
      title: 'Review Pending Members',
      description: 'Approve or reject member applications',
      href: '/members?status=pending',
      icon: ClockIcon,
      color: 'yellow',
      badge: 23
    },
    {
      title: 'Invite New Members',
      description: 'Send invitations to potential community members',
      href: '/members/invite',
      icon: UserPlusIcon,
      color: 'green'
    },
    {
      title: 'View Analytics',
      description: 'Check community growth and engagement metrics',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'purple'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      href: '/settings',
      icon: Cog6ToothIcon,
      color: 'indigo'
    },
    {
      title: 'System Alerts',
      description: 'Review system notifications and alerts',
      href: '/alerts',
      icon: ExclamationTriangleIcon,
      color: 'red',
      badge: 3
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-gray-600">
          Common administrative tasks and shortcuts
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {actions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              href={action.href}
              icon={action.icon}
              color={action.color}
              badge={action.badge}
              external={action.external}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 