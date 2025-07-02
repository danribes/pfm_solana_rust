import React, { useState, useCallback } from 'react';

interface BugReport {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'accessibility' | 'other';
  browserInfo: string;
  deviceInfo: string;
  url: string;
  userAgent: string;
  screenshot?: File;
  userId?: string;
  sessionId?: string;
}

interface BugReporterProps {
  onSubmit: (bugReport: BugReport) => Promise<void>;
  onCancel?: () => void;
  userId?: string;
  sessionId?: string;
}

const BugReporter: React.FC<BugReporterProps> = ({
  onSubmit,
  onCancel,
  userId,
  sessionId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [bugReport, setBugReport] = useState<Partial<BugReport>>({
    severity: 'medium',
    category: 'functionality',
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    browserInfo: getBrowserInfo(),
    deviceInfo: getDeviceInfo(),
    userId,
    sessionId,
  });

  function getBrowserInfo() {
    if (typeof navigator === 'undefined') return 'Unknown';
    
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    return `${browser} - ${userAgent}`;
  }

  function getDeviceInfo() {
    if (typeof window === 'undefined') return 'Unknown';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    
    return `${isMobile ? 'Mobile' : 'Desktop'} - Screen: ${screenSize}, Viewport: ${viewportSize}`;
  }

  const updateBugReport = useCallback((field: keyof BugReport, value: any) => {
    setBugReport(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(bugReport as BugReport);
      alert('Bug report submitted successfully! Thank you for helping us improve.');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to submit bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const required = ['title', 'description', 'severity', 'category'];
    return required.every(field => bugReport[field as keyof BugReport]);
  };

  const handleScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateBugReport('screenshot', file);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Bug Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bug Title *
        </label>
        <input
          type="text"
          value={bugReport.title || ''}
          onChange={(e) => updateBugReport('title', e.target.value)}
          placeholder="Brief description of the bug"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity *
        </label>
        <select
          value={bugReport.severity || 'medium'}
          onChange={(e) => updateBugReport('severity', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low - Minor cosmetic issues</option>
          <option value="medium">Medium - Functionality affected but workaround available</option>
          <option value="high">High - Major functionality broken</option>
          <option value="critical">Critical - Application unusable</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={bugReport.category || 'functionality'}
          onChange={(e) => updateBugReport('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ui">UI/Visual Issues</option>
          <option value="functionality">Functionality Problems</option>
          <option value="performance">Performance Issues</option>
          <option value="security">Security Concerns</option>
          <option value="accessibility">Accessibility Problems</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={bugReport.description || ''}
          onChange={(e) => updateBugReport('description', e.target.value)}
          placeholder="Detailed description of the bug..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Reproduction Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Steps to Reproduce
        </label>
        <textarea
          value={bugReport.stepsToReproduce || ''}
          onChange={(e) => updateBugReport('stepsToReproduce', e.target.value)}
          placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe that..."
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Behavior
        </label>
        <textarea
          value={bugReport.expectedBehavior || ''}
          onChange={(e) => updateBugReport('expectedBehavior', e.target.value)}
          placeholder="What did you expect to happen?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Actual Behavior
        </label>
        <textarea
          value={bugReport.actualBehavior || ''}
          onChange={(e) => updateBugReport('actualBehavior', e.target.value)}
          placeholder="What actually happened?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Screenshot (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleScreenshot}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {bugReport.screenshot && (
          <p className="mt-1 text-sm text-gray-600">
            Selected: {bugReport.screenshot.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Where Bug Occurred
        </label>
        <input
          type="url"
          value={bugReport.url || ''}
          onChange={(e) => updateBugReport('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Browser Information
        </label>
        <textarea
          value={bugReport.browserInfo || ''}
          onChange={(e) => updateBugReport('browserInfo', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Device Information
        </label>
        <textarea
          value={bugReport.deviceInfo || ''}
          onChange={(e) => updateBugReport('deviceInfo', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          readOnly
        />
      </div>
    </div>
  );

  const totalSteps = 3;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Report a Bug
        </h2>
        <p className="text-gray-600 mt-1">
          Help us improve by reporting any issues you encounter
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-96">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          )}
        </div>
      </div>

      {/* Form Validation Message */}
      {currentStep === totalSteps && !isFormValid() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please fill in all required fields (Title, Description, Severity, Category) before submitting.
          </p>
        </div>
      )}

      {/* Severity Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Severity Guidelines:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li><strong>Critical:</strong> Application crashes, data loss, security vulnerabilities</li>
          <li><strong>High:</strong> Major features not working, blocking user workflows</li>
          <li><strong>Medium:</strong> Features work but with issues, workarounds available</li>
          <li><strong>Low:</strong> Cosmetic issues, minor inconveniences</li>
        </ul>
      </div>
    </div>
  );
};

export default BugReporter;