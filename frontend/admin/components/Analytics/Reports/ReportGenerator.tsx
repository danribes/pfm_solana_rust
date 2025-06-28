import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, ChartBarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../UI/LoadingSpinner';
import { useReports, useAnalyticsOverview } from '../../../hooks/useAnalytics';
import { ReportTemplate, ReportGenerationRequest, AnalyticsFilters } from '../../../types/analytics';

const ReportGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState<AnalyticsFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const { 
    templates, 
    loading: templatesLoading, 
    generateReport, 
    generateLoading 
  } = useReports();

  const reportSections = [
    {
      id: 'community_overview',
      name: 'Community Overview',
      description: 'General community statistics and growth metrics',
      icon: UserGroupIcon,
    },
    {
      id: 'voting_analytics',
      name: 'Voting Analytics',
      description: 'Voting participation and proposal statistics',
      icon: ChartBarIcon,
    },
    {
      id: 'user_activity',
      name: 'User Activity',
      description: 'User engagement and activity patterns',
      icon: ClockIcon,
    },
    {
      id: 'system_health',
      name: 'System Health',
      description: 'Performance metrics and system status',
      icon: DocumentTextIcon,
    },
  ];

  useEffect(() => {
    if (selectedTemplate) {
      setReportTitle(selectedTemplate.name);
      setDescription(selectedTemplate.description);
      setSelectedSections(selectedTemplate.sections || []);
    }
  }, [selectedTemplate]);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGenerateReport = async () => {
    if (!reportTitle.trim() || selectedSections.length === 0) {
      alert('Please provide a report title and select at least one section.');
      return;
    }

    const request: ReportGenerationRequest = {
      title: reportTitle,
      description,
      template_id: selectedTemplate?.id,
      sections: selectedSections,
      filters: dateRange,
      options: {
        include_charts: includeCharts,
        include_raw_data: includeRawData,
        format: 'PDF',
      },
    };

    try {
      const report = await generateReport(request);
      alert(`Report "${report.title}" is being generated. You'll be notified when it's ready.`);
      
      // Reset form
      setReportTitle('');
      setDescription('');
      setSelectedSections([]);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Report Templates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                <h4 className="ml-3 text-sm font-medium text-gray-900">
                  {template.name}
                </h4>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {template.description}
              </p>
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
                    <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M6.4 0L5.1 1.3 2.6 3.8 1.5 2.6 0.2 3.9 2.6 6.3 6.4 2.5 7.7 1.2z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Custom Template Option */}
          <div
            onClick={() => setSelectedTemplate(null)}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
              selectedTemplate === null
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
              <h4 className="ml-3 text-sm font-medium text-gray-900">
                Custom Report
              </h4>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Build a custom report with your own sections and settings
            </p>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate.split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value).toISOString()
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate.split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value).toISOString()
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Report Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Report Sections *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportSections.map((section) => (
                <div
                  key={section.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedSections.includes(section.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSectionToggle(section.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <section.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {section.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                    {selectedSections.includes(section.id) && (
                      <div className="flex-shrink-0">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
                          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M6.4 0L5.1 1.3 2.6 3.8 1.5 2.6 0.2 3.9 2.6 6.3 6.4 2.5 7.7 1.2z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Report Options
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="include-charts"
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="include-charts" className="ml-2 block text-sm text-gray-900">
                  Include charts and visualizations
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="include-raw-data"
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="include-raw-data" className="ml-2 block text-sm text-gray-900">
                  Include raw data tables
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateReport}
          disabled={generateLoading || !reportTitle.trim() || selectedSections.length === 0}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {generateLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <>
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator; 