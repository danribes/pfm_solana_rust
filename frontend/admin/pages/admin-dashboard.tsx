import React, { useState, useEffect } from 'react';
import UserManagement from '../components/UserManagement';
import PollManagement from '../components/PollManagement';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    verified: number;
    restricted: number;
  };
  polls: {
    total: number;
    active: number;
    createdToday: number;
    createdThisWeek: number;
    totalVotes: number;
    averageParticipation: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_action' | 'poll_action' | 'system_event' | 'security_alert';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  details?: any;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'polls' | 'analytics' | 'settings'>('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    users: {
      total: 1247,
      active: 893,
      newToday: 12,
      newThisWeek: 78,
      verified: 956,
      restricted: 23
    },
    polls: {
      total: 156,
      active: 8,
      createdToday: 3,
      createdThisWeek: 15,
      totalVotes: 12847,
      averageParticipation: 67.3
    },
    system: {
      uptime: 99.8,
      responseTime: 142,
      errorRate: 0.02,
      activeConnections: 156
    },
    engagement: {
      dailyActiveUsers: 234,
      weeklyActiveUsers: 678,
      monthlyActiveUsers: 1156,
      averageSessionDuration: 18.5
    }
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user_action',
      title: 'User Account Suspended',
      description: 'User @charlie_brown suspended for spam voting',
      timestamp: '2024-12-18T14:30:00Z',
      severity: 'medium',
      user: 'Admin Alice'
    },
    {
      id: '2',
      type: 'poll_action',
      title: 'Poll Created',
      description: 'New governance poll "Token Distribution" created',
      timestamp: '2024-12-18T13:15:00Z',
      severity: 'low',
      user: 'Bob Smith'
    },
    {
      id: '3',
      type: 'system_event',
      title: 'High Traffic Detected',
      description: 'Unusual voting activity on governance poll',
      timestamp: '2024-12-18T12:45:00Z',
      severity: 'high'
    },
    {
      id: '4',
      type: 'security_alert',
      title: 'Failed Login Attempts',
      description: 'Multiple failed login attempts detected from IP 192.168.1.100',
      timestamp: '2024-12-18T11:20:00Z',
      severity: 'critical'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Low Participation Alert',
      message: 'Poll "Community Budget 2025" has only 23% participation with 6 hours remaining',
      timestamp: '2024-12-18T10:00:00Z',
      isRead: false,
      actions: [
        {
          label: 'Send Reminder',
          action: () => console.log('Sending reminder')
        },
        {
          label: 'Extend Deadline',
          action: () => console.log('Extending deadline')
        }
      ]
    },
    {
      id: '2',
      type: 'error',
      title: 'System Error',
      message: 'Vote counting service experienced temporary downtime (resolved)',
      timestamp: '2024-12-18T08:30:00Z',
      isRead: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Security Update',
      message: 'All systems updated with latest security patches',
      timestamp: '2024-12-18T07:00:00Z',
      isRead: true
    }
  ]);

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Alerts Section */}
      {alerts.filter(alert => !alert.isRead).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          {alerts.filter(alert => !alert.isRead).map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {alert.actions?.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded text-xs font-medium hover:bg-opacity-30"
                    >
                      {action.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, isRead: true } : a))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.users.total.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{dashboardStats.users.newThisWeek} this week</p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">{dashboardStats.users.active}</span>
              <span className="text-gray-500 ml-1">active users</span>
            </div>
          </div>

          {/* Poll Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Polls</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.polls.total}</p>
                <p className="text-xs text-green-600 mt-1">+{dashboardStats.polls.createdThisWeek} this week</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">{dashboardStats.polls.active}</span>
              <span className="text-gray-500 ml-1">active polls</span>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.engagement.dailyActiveUsers}</p>
                <p className="text-xs text-green-600 mt-1">↗ 12% vs yesterday</p>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600">{dashboardStats.engagement.averageSessionDuration}min</span>
              <span className="text-gray-500 ml-1">avg session</span>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">System Uptime</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.system.uptime}%</p>
                <p className="text-xs text-green-600 mt-1">{dashboardStats.system.responseTime}ms response</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600">{dashboardStats.system.errorRate}%</span>
              <span className="text-gray-500 ml-1">error rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  activity.severity === 'critical' ? 'bg-red-500' :
                  activity.severity === 'high' ? 'bg-orange-500' :
                  activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(activity.severity)}`}>
                      {activity.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => setActiveView('users')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Manage Users</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={() => setActiveView('polls')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Manage Polls</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={() => setActiveView('analytics')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Analytics</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={() => setActiveView('settings')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">System Settings</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cache</span>
                <span className="text-sm font-medium text-green-600">Optimal</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Endpoints</span>
                <span className="text-sm font-medium text-green-600">All Running</span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <span className="text-sm font-medium text-gray-900">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Comprehensive insights into community engagement and voting patterns
        </p>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{dashboardStats.engagement.dailyActiveUsers}</div>
            <div className="text-sm text-gray-600">Daily Active Users</div>
            <div className="text-xs text-green-600 mt-1">↗ 12% from yesterday</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{dashboardStats.engagement.weeklyActiveUsers}</div>
            <div className="text-sm text-gray-600">Weekly Active Users</div>
            <div className="text-xs text-green-600 mt-1">↗ 8% from last week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{dashboardStats.engagement.monthlyActiveUsers}</div>
            <div className="text-sm text-gray-600">Monthly Active Users</div>
            <div className="text-xs text-green-600 mt-1">↗ 15% from last month</div>
          </div>
        </div>

        {/* Voting Analytics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{dashboardStats.polls.totalVotes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Votes Cast</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{dashboardStats.polls.averageParticipation}%</div>
              <div className="text-sm text-gray-600">Avg Participation</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{dashboardStats.engagement.averageSessionDuration}min</div>
              <div className="text-sm text-gray-600">Avg Session Duration</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">Vote Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Placeholder for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">User Growth Over Time</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              📈 Chart placeholder - User growth trends
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Poll Participation Rates</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              📊 Chart placeholder - Participation analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure system-wide settings and preferences
        </p>

        <div className="space-y-8">
          {/* General Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Maintenance Mode</label>
                  <p className="text-sm text-gray-500">Enable maintenance mode to prevent user access</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">User Registration</label>
                  <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Send automated email notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="pt-8 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="60"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failed Login Attempts Limit
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-8 border-t">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'polls', label: 'Polls', icon: '🗳️' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'users' && <UserManagement />}
        {activeView === 'polls' && <PollManagement />}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default AdminDashboard; 