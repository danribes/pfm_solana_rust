// Screen Reader Support Demo - Task 4.6.2 Sub-task 3: Screen Reader Support
// WCAG 2.1 AA Compliance - Comprehensive screen reader accessibility testing

import React, { useState, useEffect } from "react";
import useAccessibility from "../src/hooks/useAccessibility";
import SemanticLayout from "../src/components/Accessible/SemanticLayout";
import AccessibleButton from "../src/components/Accessible/AccessibleButton";
import ScreenReaderSupport, { 
  AccessibleImage, 
  AccessibleForm, 
  AccessibleInput, 
  AccessibleAlert 
} from "../src/components/Accessible/ScreenReaderSupport";

const ScreenReaderDemo: React.FC = () => {
  const { announce, announcements } = useAccessibility();
  const [activeTest, setActiveTest] = useState("overview");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertType, setAlertType] = useState<"info" | "success" | "warning" | "error">("info");
  const [alertVisible, setAlertVisible] = useState(false);
  const [dynamicContent, setDynamicContent] = useState("Initial content");
  const [loadingState, setLoadingState] = useState(false);

  // Demo announcements
  const makeAnnouncement = (message: string, priority: "polite" | "assertive" = "polite") => {
    announce(message, priority);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      announce("Form submitted successfully!", "assertive");
      setFormData({ name: "", email: "", message: "" });
    } else {
      announce(`Form has ${Object.keys(errors).length} validation errors`, "assertive");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const simulateLoading = () => {
    setLoadingState(true);
    announce("Loading started", "polite");
    
    setTimeout(() => {
      setLoadingState(false);
      announce("Loading completed", "assertive");
    }, 3000);
  };

  const updateDynamicContent = () => {
    const contents = [
      "Content updated successfully",
      "New information available",
      "Data refreshed",
      "Status changed to active",
      "Update completed"
    ];
    const newContent = contents[Math.floor(Math.random() * contents.length)];
    setDynamicContent(newContent);
    announce(`Dynamic content updated: ${newContent}`, "polite");
  };

  const showAlert = (type: "info" | "success" | "warning" | "error") => {
    setAlertType(type);
    setAlertVisible(true);
  };

  const TestSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="bg-white rounded-lg shadow p-6 mb-6" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`}>
      <h2 id={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`} className="text-xl font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );

  return (
    <SemanticLayout>
      <ScreenReaderSupport announcePageChanges={true} announceStatusUpdates={true}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Screen Reader Support Testing
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Task 4.6.2: WCAG 2.1 AA Compliance - Sub-task 3: Screen Reader Support
            </p>
            
            {/* Screen Reader Features Status */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">🔊 Screen Reader Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>✅ ARIA live regions</div>
                <div>✅ Dynamic content announcements</div>
                <div>✅ Form validation feedback</div>
                <div>✅ Status message support</div>
                <div>✅ Image alt text descriptions</div>
                <div>✅ Form labeling and associations</div>
                <div>✅ Error identification</div>
                <div>✅ Page change announcements</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-1" role="complementary" aria-label="Screen reader test navigation">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Screen Reader Tests</h2>
                <nav aria-label="Screen reader test navigation" className="space-y-2">
                  <AccessibleButton
                    variant={activeTest === "overview" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => {
                      setActiveTest("overview");
                      announce("Switched to overview section");
                    }}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "overview"}
                  >
                    Overview
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "announcements" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => {
                      setActiveTest("announcements");
                      announce("Switched to announcements section");
                    }}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "announcements"}
                  >
                    Live Announcements
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "forms" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => {
                      setActiveTest("forms");
                      announce("Switched to accessible forms section");
                    }}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "forms"}
                  >
                    Accessible Forms
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "images" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => {
                      setActiveTest("images");
                      announce("Switched to accessible images section");
                    }}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "images"}
                  >
                    Accessible Images
                  </AccessibleButton>
                </nav>

                {/* Announcements Log */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Announcements</h3>
                  <div className="space-y-1 text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {announcements.length > 0 ? (
                      announcements.slice(-5).map((announcement, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          {announcement}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 italic">No announcements yet...</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Test Content */}
            <main className="lg:col-span-2" role="main" aria-label="Screen reader testing content">
              
              {/* Overview Tab */}
              {activeTest === "overview" && (
                <TestSection title="Screen Reader Support Overview">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-4">
                      This demonstration showcases comprehensive screen reader support following WCAG 2.1 AA guidelines.
                      All content is properly structured for assistive technologies.
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Testing Tips:</h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Enable your screen reader (NVDA, JAWS, VoiceOver, etc.)</li>
                        <li>• Navigate using screen reader commands</li>
                        <li>• Listen for announcements when interacting with elements</li>
                        <li>• Use landmarks navigation (main, nav, aside, etc.)</li>
                        <li>• Test form validation and error announcements</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">WCAG 2.1 Criteria Met:</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li><strong>1.1.1 Non-text Content:</strong> All images have appropriate alternative text</li>
                      <li><strong>1.3.1 Info and Relationships:</strong> Proper semantic structure and ARIA labels</li>
                      <li><strong>3.3.1 Error Identification:</strong> Form errors clearly identified</li>
                      <li><strong>3.3.2 Labels or Instructions:</strong> All form controls properly labeled</li>
                      <li><strong>4.1.2 Name, Role, Value:</strong> All UI components have accessible names</li>
                      <li><strong>4.1.3 Status Messages:</strong> Dynamic content changes announced</li>
                    </ul>
                  </div>

                  <div className="mt-6 space-y-3">
                    <AccessibleButton 
                      variant="primary" 
                      onClick={() => makeAnnouncement("Welcome! Screen reader support is active.")}
                    >
                      Test Welcome Announcement
                    </AccessibleButton>
                    <AccessibleButton 
                      variant="secondary" 
                      onClick={() => makeAnnouncement("This is a polite announcement", "polite")}
                    >
                      Test Polite Announcement
                    </AccessibleButton>
                    <AccessibleButton 
                      variant="warning" 
                      onClick={() => makeAnnouncement("This is an assertive announcement!", "assertive")}
                    >
                      Test Assertive Announcement
                    </AccessibleButton>
                  </div>
                </TestSection>
              )}

              {/* Live Announcements Tab */}
              {activeTest === "announcements" && (
                <TestSection title="Live Announcements Testing">
                  <div className="space-y-6">
                    {/* Alert Testing */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Alert Announcements</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <AccessibleButton 
                          size="small" 
                          variant="primary"
                          onClick={() => showAlert("info")}
                        >
                          Info Alert
                        </AccessibleButton>
                        <AccessibleButton 
                          size="small" 
                          variant="success"
                          onClick={() => showAlert("success")}
                        >
                          Success Alert
                        </AccessibleButton>
                        <AccessibleButton 
                          size="small" 
                          variant="warning"
                          onClick={() => showAlert("warning")}
                        >
                          Warning Alert
                        </AccessibleButton>
                        <AccessibleButton 
                          size="small" 
                          variant="danger"
                          onClick={() => showAlert("error")}
                        >
                          Error Alert
                        </AccessibleButton>
                      </div>
                      
                      {alertVisible && (
                        <AccessibleAlert
                          type={alertType}
                          dismissible={true}
                          onDismiss={() => setAlertVisible(false)}
                        >
                          This is a {alertType} alert that will be announced to screen readers automatically.
                        </AccessibleAlert>
                      )}
                    </div>

                    {/* Dynamic Content */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Dynamic Content Updates</h3>
                      <div 
                        className="p-3 bg-blue-50 rounded border border-blue-200 mb-3"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <strong>Status:</strong> {dynamicContent}
                      </div>
                      <AccessibleButton onClick={updateDynamicContent} variant="secondary">
                        Update Dynamic Content
                      </AccessibleButton>
                    </div>

                    {/* Loading States */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Loading State Announcements</h3>
                      <div className="space-y-3">
                        <div 
                          className="p-3 bg-gray-50 rounded"
                          aria-live="polite"
                          aria-busy={loadingState}
                        >
                          {loadingState ? "Loading..." : "Ready"}
                        </div>
                        <AccessibleButton 
                          onClick={simulateLoading}
                          disabled={loadingState}
                          isLoading={loadingState}
                          loadingText="Loading..."
                          variant="primary"
                        >
                          Simulate Loading
                        </AccessibleButton>
                      </div>
                    </div>
                  </div>
                </TestSection>
              )}

              {/* Accessible Forms Tab */}
              {activeTest === "forms" && (
                <TestSection title="Accessible Forms Testing">
                  <AccessibleForm
                    title="Contact Form"
                    description="This form demonstrates proper labeling, error handling, and screen reader announcements."
                    onSubmit={handleFormSubmit}
                    announce={announce}
                  >
                    <AccessibleInput
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      error={formErrors.name}
                      required={true}
                      hint="Enter your first and last name"
                      announce={announce}
                    />
                    
                    <AccessibleInput
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      error={formErrors.email}
                      required={true}
                      hint="We will use this to contact you"
                      announce={announce}
                    />
                    
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                        <span className="text-red-500 ml-1" aria-label="required">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        aria-invalid={formErrors.message ? "true" : "false"}
                        aria-required="true"
                        aria-describedby={formErrors.message ? "message-error" : undefined}
                        rows={4}
                        className={`
                          w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${formErrors.message ? "border-red-300 bg-red-50" : "border-gray-300"}
                        `}
                        placeholder="Enter your message here..."
                      />
                      {formErrors.message && (
                        <p id="message-error" className="text-xs text-red-600 mt-1" role="alert">
                          {formErrors.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <AccessibleButton type="submit" variant="primary">
                        Submit Form
                      </AccessibleButton>
                      <AccessibleButton 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          setFormData({ name: "", email: "", message: "" });
                          setFormErrors({});
                          announce("Form cleared");
                        }}
                      >
                        Clear Form
                      </AccessibleButton>
                    </div>
                  </AccessibleForm>
                </TestSection>
              )}

              {/* Accessible Images Tab */}
              {activeTest === "images" && (
                <TestSection title="Accessible Images Testing">
                  <div className="space-y-6">
                    {/* Informative Image */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Informative Image</h3>
                      <AccessibleImage
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzOTlmZiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iNXB4Ij5EYXNoYm9hcmQgQ2hhcnQ8L3RleHQ+PC9zdmc+"
                        alt="Dashboard chart showing 75% completion rate with upward trend"
                        description="A blue chart visualization displaying project completion metrics. The chart shows a 75% completion rate with a positive upward trend line indicating improved performance over the last quarter."
                        caption="Q4 2024 Project Completion Metrics"
                        className="border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Decorative Image */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Decorative Image</h3>
                      <AccessibleImage
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjM5ZjAwO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmYzEwMDtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg=="
                        alt=""
                        decorative={true}
                        caption="Decorative gradient banner (no alt text needed)"
                        className="border border-gray-200 rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        This image is marked as decorative and will be ignored by screen readers.
                      </p>
                    </div>

                    {/* Complex Image with Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Complex Image with Extended Description</h3>
                      <AccessibleImage
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y5ZmFmYiIgc3Ryb2tlPSIjZDFkNWRiIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iIzMzOTlmZiIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxMDAiIHI9IjI1IiBmaWxsPSIjZjU5ZTBiIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnViYmxlIENoYXJ0PC90ZXh0Pjwvc3ZnPg=="
                        alt="Bubble chart comparing three data points"
                        description="Interactive bubble chart displaying three categories of data. Blue bubble (largest) represents 45% market share, green bubble (smallest) represents 20% market share, yellow bubble (medium) represents 35% market share. All bubbles are positioned horizontally with relative sizing indicating proportional values."
                        caption="Market Share Analysis - Bubble Chart Visualization"
                        className="border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                </TestSection>
              )}
            </main>
          </div>

          {/* Task Completion Status */}
          <footer className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-900">
                  Task 4.6.2 Sub-task 3: Screen Reader Support ✅
                </h3>
                <p className="text-green-700">
                  Comprehensive screen reader support with ARIA live regions, proper labeling, and dynamic announcements
                </p>
                <div className="mt-2 text-sm text-green-600">
                  ✅ Live regions • ✅ Form accessibility • ✅ Image alt text<br/>
                  ✅ Error announcements • ✅ Status updates • ✅ Dynamic content support
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ScreenReaderSupport>
    </SemanticLayout>
  );
};

export default ScreenReaderDemo;
