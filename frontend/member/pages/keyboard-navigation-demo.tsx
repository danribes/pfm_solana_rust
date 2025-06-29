// Keyboard Navigation Demo - Task 4.6.2 Sub-task 2: Keyboard Navigation
// WCAG 2.1 AA Compliance - Comprehensive keyboard accessibility testing

import React, { useState, useRef } from "react";
import useAccessibility from "../src/hooks/useAccessibility";
import SemanticLayout from "../src/components/Accessible/SemanticLayout";
import AccessibleButton from "../src/components/Accessible/AccessibleButton";
import KeyboardNavigation from "../src/components/Accessible/KeyboardNavigation";
import FocusManagement, { useFocusManagement } from "../src/components/Accessible/FocusManagement";

const KeyboardNavigationDemo: React.FC = () => {
  const { announce, config } = useAccessibility();
  const { saveFocus, restoreFocus, moveFocusTo, trapFocusIn } = useFocusManagement();
  const [activeTest, setActiveTest] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [focusTrapActive, setFocusTrapActive] = useState(false);
  const [keyboardLog, setKeyboardLog] = useState<string[]>([]);
  const focusTrapRef = useRef<HTMLDivElement>(null);

  const logKeyboardAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setKeyboardLog(prev => [...prev.slice(-4), `${timestamp}: ${action}`]);
    announce(action, "polite");
  };

  const handleShortcut = (shortcut: string) => {
    logKeyboardAction(`Keyboard shortcut activated: ${shortcut}`);
  };

  const openModal = () => {
    saveFocus();
    setModalOpen(true);
    logKeyboardAction("Modal opened - focus saved");
  };

  const closeModal = () => {
    setModalOpen(false);
    restoreFocus();
    logKeyboardAction("Modal closed - focus restored");
  };

  const activateFocusTrap = () => {
    if (focusTrapRef.current) {
      const cleanup = trapFocusIn(focusTrapRef.current);
      setFocusTrapActive(true);
      logKeyboardAction("Focus trap activated");
      
      // Auto-deactivate after 10 seconds for demo
      setTimeout(() => {
        cleanup();
        setFocusTrapActive(false);
        logKeyboardAction("Focus trap deactivated");
      }, 10000);
    }
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
      <KeyboardNavigation 
        enableShortcuts={true}
        enableArrowNavigation={true}
        onShortcut={handleShortcut}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Keyboard Navigation Testing
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Task 4.6.2: WCAG 2.1 AA Compliance - Sub-task 2: Keyboard Navigation
            </p>
            
            {/* Keyboard Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">🎯 Keyboard Navigation Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>✅ Tab navigation support</div>
                <div>✅ Arrow key navigation</div>
                <div>✅ Keyboard shortcuts (/, h, d, ?)</div>
                <div>✅ Focus management & trapping</div>
                <div>✅ Skip links</div>
                <div>✅ Modal focus handling</div>
                <div>✅ Escape key support</div>
                <div>✅ Enter/Space activation</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-1" role="complementary" aria-label="Test navigation">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Tests</h2>
                <nav aria-label="Keyboard test navigation" className="space-y-2">
                  <AccessibleButton
                    variant={activeTest === "overview" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => setActiveTest("overview")}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "overview"}
                  >
                    Overview
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "shortcuts" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => setActiveTest("shortcuts")}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "shortcuts"}
                  >
                    Keyboard Shortcuts
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "focus-management" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => setActiveTest("focus-management")}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "focus-management"}
                  >
                    Focus Management
                  </AccessibleButton>
                  <AccessibleButton
                    variant={activeTest === "navigation" ? "primary" : "secondary"}
                    size="medium"
                    onClick={() => setActiveTest("navigation")}
                    className="w-full text-left justify-start"
                    aria-pressed={activeTest === "navigation"}
                  >
                    Tab Navigation
                  </AccessibleButton>
                </nav>

                {/* Keyboard Activity Log */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Activity Log</h3>
                  <div className="space-y-1 text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {keyboardLog.length > 0 ? (
                      keyboardLog.map((log, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 italic">Use keyboard to see activity...</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Test Content */}
            <main className="lg:col-span-2" role="main" aria-label="Keyboard navigation tests">
              
              {/* Overview Tab */}
              {activeTest === "overview" && (
                <TestSection title="Keyboard Navigation Overview">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-4">
                      This demo showcases comprehensive keyboard navigation support following WCAG 2.1 AA guidelines.
                      All interactive elements are keyboard accessible with proper focus management.
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Try These Keyboard Actions:</h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Tab</kbd> - Navigate forward through elements</li>
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Shift + Tab</kbd> - Navigate backward</li>
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">↑↓</kbd> - Arrow navigation in lists</li>
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Enter/Space</kbd> - Activate buttons</li>
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Escape</kbd> - Close modals</li>
                        <li><kbd className="bg-white px-2 py-1 rounded border text-xs">?</kbd> - Show keyboard shortcuts</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">WCAG 2.1 Criteria Met:</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li><strong>2.1.1 Keyboard:</strong> All functionality available via keyboard</li>
                      <li><strong>2.1.2 No Keyboard Trap:</strong> Focus can move away from components</li>
                      <li><strong>2.4.3 Focus Order:</strong> Logical focus order maintained</li>
                      <li><strong>2.4.7 Focus Visible:</strong> Clear focus indicators provided</li>
                      <li><strong>3.2.1 On Focus:</strong> No unexpected context changes</li>
                    </ul>
                  </div>
                </TestSection>
              )}

              {/* Keyboard Shortcuts Tab */}
              {activeTest === "shortcuts" && (
                <TestSection title="Keyboard Shortcuts Testing">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {[
                      { key: "/", description: "Focus search input", action: "focus-search" },
                      { key: "h", description: "Go to homepage", action: "go-home" },
                      { key: "d", description: "Go to dashboard", action: "go-dashboard" },
                      { key: "?", description: "Show keyboard shortcuts help", action: "show-help" },
                      { key: "Esc", description: "Close modal/dialog", action: "close-modal" },
                    ].map((shortcut, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <kbd className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                            {shortcut.key}
                          </kbd>
                          <AccessibleButton
                            size="small"
                            variant="secondary"
                            onClick={() => logKeyboardAction(`Shortcut ${shortcut.key} tested via click`)}
                          >
                            Test
                          </AccessibleButton>
                        </div>
                        <p className="text-sm text-gray-600">{shortcut.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Press the keys directly (not in form fields) to trigger shortcuts</li>
                      <li>• Watch the activity log for confirmation</li>
                      <li>• Some shortcuts may navigate away from this page</li>
                    </ul>
                  </div>
                </TestSection>
              )}

              {/* Focus Management Tab */}
              {activeTest === "focus-management" && (
                <TestSection title="Focus Management Testing">
                  <div className="space-y-6">
                    {/* Modal Test */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Modal Focus Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Test focus saving/restoration when opening and closing modals.
                      </p>
                      <AccessibleButton onClick={openModal} variant="primary">
                        Open Modal (saves focus)
                      </AccessibleButton>
                    </div>

                    {/* Focus Trap Test */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Focus Trap Testing</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Test focus trapping within a container. Focus will be trapped for 10 seconds.
                      </p>
                      
                      <FocusManagement trapFocus={focusTrapActive} className="space-y-3">
                        <div
                          ref={focusTrapRef}
                          className={`p-4 border-2 rounded-lg ${focusTrapActive ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                        >
                          <p className="text-sm mb-3">
                            {focusTrapActive ? "🔒 Focus is trapped in this area" : "Focus trap area (inactive)"}
                          </p>
                          <div className="space-x-2">
                            <AccessibleButton size="small" variant="secondary">Button 1</AccessibleButton>
                            <AccessibleButton size="small" variant="secondary">Button 2</AccessibleButton>
                            <AccessibleButton size="small" variant="secondary">Button 3</AccessibleButton>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Test input"
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </FocusManagement>
                      
                      <AccessibleButton 
                        onClick={activateFocusTrap} 
                        variant="warning"
                        disabled={focusTrapActive}
                        className="mt-3"
                      >
                        {focusTrapActive ? "Focus Trap Active" : "Activate Focus Trap"}
                      </AccessibleButton>
                    </div>

                    {/* Focus Indicators */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Focus Indicators</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        All elements have visible focus indicators when navigated with keyboard.
                      </p>
                      <div className="space-y-2">
                        <AccessibleButton variant="primary" size="small">Primary Button</AccessibleButton>
                        <AccessibleButton variant="secondary" size="small">Secondary Button</AccessibleButton>
                        <input 
                          type="text" 
                          placeholder="Input field"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select option</option>
                          <option>Option 1</option>
                          <option>Option 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TestSection>
              )}

              {/* Tab Navigation Tab */}
              {activeTest === "navigation" && (
                <TestSection title="Tab Navigation Order">
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Use Tab and Shift+Tab to navigate through these elements in logical order:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 8 }, (_, i) => (
                        <AccessibleButton
                          key={i}
                          variant="secondary"
                          size="medium"
                          className="w-full"
                          onClick={() => logKeyboardAction(`Tab order ${i + 1} activated`)}
                        >
                          Tab Order {i + 1}
                        </AccessibleButton>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Navigation Tips:</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Tab moves forward through interactive elements</li>
                        <li>• Shift + Tab moves backward</li>
                        <li>• Order should be logical and predictable</li>
                        <li>• No elements should be unreachable</li>
                      </ul>
                    </div>
                  </div>
                </TestSection>
              )}
            </main>
          </div>

          {/* Modal */}
          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              role="dialog"
              aria-labelledby="modal-title"
              aria-modal="true"
            >
              <FocusManagement autoFocus={true} trapFocus={true}>
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                  <h2 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                    Focus Management Modal
                  </h2>
                  <p className="text-gray-700 mb-4">
                    This modal demonstrates proper focus management. Focus was saved when opened 
                    and will be restored when closed.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="First focusable element"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Second focusable element"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <AccessibleButton variant="secondary" onClick={closeModal}>
                      Cancel
                    </AccessibleButton>
                    <AccessibleButton variant="primary" onClick={closeModal}>
                      Close (Restores Focus)
                    </AccessibleButton>
                  </div>
                </div>
              </FocusManagement>
            </div>
          )}

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
                  Task 4.6.2 Sub-task 2: Keyboard Navigation ✅
                </h3>
                <p className="text-green-700">
                  Complete keyboard accessibility with focus management, shortcuts, and WCAG 2.1 AA compliance
                </p>
                <div className="mt-2 text-sm text-green-600">
                  ✅ Tab navigation • ✅ Keyboard shortcuts • ✅ Focus management<br/>
                  ✅ Focus trapping • ✅ Skip links • ✅ Visual focus indicators
                </div>
              </div>
            </div>
          </footer>
        </div>
      </KeyboardNavigation>
    </SemanticLayout>
  );
};

export default KeyboardNavigationDemo;
