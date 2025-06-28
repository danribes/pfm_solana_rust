import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../UI/LoadingSpinner';
import { useReports } from '../../../hooks/useAnalytics';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  template_id?: string;
  next_run: string;
  last_run?: string;
  status: 'active' | 'paused' | 'failed';
  sections: string[];
}

const ReportScheduler: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'weekly' as const,
    recipients: [''],
    sections: [] as string[],
    template_id: '',
  });

  const { templates, loading: templatesLoading } = useReports();

  // Mock scheduled reports data - in real app this would come from API
  const scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      name: 'Weekly Community Report',
      description: 'Weekly overview of community activity and growth',
      frequency: 'weekly',
      recipients: ['admin@pfm.com', 'community@pfm.com'],
      next_run: '2024-12-15T09:00:00Z',
      last_run: '2024-12-08T09:00:00Z',
      status: 'active',
      sections: ['community_overview', 'voting_analytics'],
    },
    {
      id: '2',
      name: 'Monthly Analytics Summary',
      description: 'Comprehensive monthly analytics across all metrics',
      frequency: 'monthly',
      recipients: ['executives@pfm.com'],
      next_run: '2024-12-31T10:00:00Z',
      last_run: '2024-11-30T10:00:00Z',
      status: 'active',
      sections: ['community_overview', 'voting_analytics', 'user_activity', 'system_health'],
    },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  const sectionOptions = [
    { id: 'community_overview', name: 'Community Overview' },
    { id: 'voting_analytics', name: 'Voting Analytics' },
    { id: 'user_activity', name: 'User Activity' },
    { id: 'system_health', name: 'System Health' },
  ];

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
      frequency: 'weekly',
      recipients: [''],
      sections: [],
      template_id: '',
    });
  };

  const handleEdit = (report: ScheduledReport) => {
    setEditingReport(report);
    setIsCreating(true);
    setFormData({
      name: report.name,
      description: report.description,
      frequency: report.frequency,
      recipients: report.recipients,
      sections: report.sections,
      template_id: report.template_id || '',
    });
  };

  const handleSave = async () => {
    try {
      // API call to save/update scheduled report
      console.log('Saving scheduled report:', formData);
      setIsCreating(false);
      setEditingReport(null);
    } catch (error) {
      console.error('Error saving scheduled report:', error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingReport(null);
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    setFormData(prev => ({ ...prev, recipients: newRecipients }));
  };

  const addRecipient = () => {
    setFormData(prev => ({ ...prev, recipients: [...prev.recipients, ''] }));
  };

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status as keyof typeof classes]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Scheduled Reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Automate report generation and delivery
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CalendarIcon className="-ml-1 mr-2 h-5 w-5" />
            Schedule Report
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
          </h4>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Recipients *
              </label>
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {formData.recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRecipient}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add another recipient
              </button>
            </div>

            {/* Report Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Report Sections *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionOptions.map((section) => (
                  <div key={section.id} className="flex items-center">
                    <input
                      id={section.id}
                      type="checkbox"
                      checked={formData.sections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={section.id} className="ml-2 block text-sm text-gray-900">
                      {section.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.recipients[0] || formData.sections.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {editingReport ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Active Schedules</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {scheduledReports.map((report) => (
            <div key={report.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h5 className="text-sm font-medium text-gray-900">{report.name}</h5>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                    </div>
                    <div>Next run: {formatDate(report.next_run)}</div>
                    {report.last_run && (
                      <div>Last run: {formatDate(report.last_run)}</div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Recipients: {report.recipients.join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(report)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler; 