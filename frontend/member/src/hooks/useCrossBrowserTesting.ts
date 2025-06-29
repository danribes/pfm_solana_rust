import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BrowserInfo,
  BrowserFeatures,
  CompatibilityReport,
  TestResult,
  BROWSER_DETECTION,
  BROWSER_SUPPORT_MATRIX,
  TESTING_CONFIG,
  POLYFILLS,
  BrowserName,
  TestSuite
} from './cross-browser-compatibility';

interface CrossBrowserTestingState {
  // Browser information
  browserInfo: BrowserInfo;
  compatibilityReport: CompatibilityReport | null;
  
  // Testing state
  isRunningTests: boolean;
  testResults: TestResult[];
  testProgress: number;
  
  // Feature support
  supportedFeatures: string[];
  unsupportedFeatures: string[];
  polyfillsNeeded: string[];
  
  // Performance metrics
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    javaScriptErrors: number;
  };
}

export function useCrossBrowserTesting(): CrossBrowserTestingState & {
  runCompatibilityTest: () => Promise<void>;
  runSpecificTest: (testSuite: TestSuite) => Promise<TestResult[]>;
  generateReport: () => CompatibilityReport;
  getPolyfillRecommendations: () => string[];
} {
  const [state, setState] = useState<CrossBrowserTestingState>(() => ({
    browserInfo: BROWSER_DETECTION.detectBrowser(),
    compatibilityReport: null,
    isRunningTests: false,
    testResults: [],
    testProgress: 0,
    supportedFeatures: [],
    unsupportedFeatures: [],
    polyfillsNeeded: [],
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      javaScriptErrors: 0
    }
  }));

  const testTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize browser detection and feature analysis
  useEffect(() => {
    const browserInfo = BROWSER_DETECTION.detectBrowser();
    const features = browserInfo.features;
    
    const supportedFeatures: string[] = [];
    const unsupportedFeatures: string[] = [];
    const polyfillsNeeded: string[] = [];

    // Analyze feature support
    Object.entries(features).forEach(([feature, supported]) => {
      if (supported) {
        supportedFeatures.push(feature);
      } else {
        unsupportedFeatures.push(feature);
        
        // Check if polyfill is available
        if (feature in POLYFILLS) {
          polyfillsNeeded.push(feature);
        }
      }
    });

    setState(prev => ({
      ...prev,
      browserInfo,
      supportedFeatures,
      unsupportedFeatures,
      polyfillsNeeded
    }));

    // Collect initial performance metrics
    collectPerformanceMetrics();
  }, []);

  // Collect performance metrics
  const collectPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
    
    // Memory usage (if available)
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0; // MB

    setState(prev => ({
      ...prev,
      performanceMetrics: {
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        javaScriptErrors: 0 // Will be updated by error listener
      }
    }));
  }, []);

  // Layout testing functions
  const testResponsiveBreakpoints = (): TestResult => {
    const breakpoints = [320, 768, 1024, 1440];
    const issues: string[] = [];
    
    breakpoints.forEach(breakpoint => {
      // Simulate different viewport sizes
      const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
      if (!mediaQuery.matches && window.innerWidth >= breakpoint) {
        issues.push(`Breakpoint ${breakpoint}px not responding correctly`);
      }
    });

    return {
      testName: 'Responsive Breakpoints',
      category: 'layout',
      status: issues.length === 0 ? 'pass' : 'warning',
      message: issues.length === 0 ? 'All breakpoints working correctly' : `${issues.length} breakpoint issues found`,
      details: issues
    };
  };

  const testCSSGridLayout = (): TestResult => {
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    testElement.style.gridTemplateColumns = '1fr 1fr';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const isGridSupported = computedStyle.display === 'grid';
    
    document.body.removeChild(testElement);

    return {
      testName: 'CSS Grid Layout',
      category: 'layout',
      status: isGridSupported ? 'pass' : 'fail',
      message: isGridSupported ? 'CSS Grid fully supported' : 'CSS Grid not supported - fallback needed',
      details: { supported: isGridSupported, fallback: 'flexbox' }
    };
  };

  const testTouchTargets = (): TestResult => {
    const touchElements = document.querySelectorAll('button, a, input, [role="button"]');
    const smallTargets: Element[] = [];
    
    touchElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets.push(element);
      }
    });

    return {
      testName: 'Touch Targets',
      category: 'accessibility',
      status: smallTargets.length === 0 ? 'pass' : 'warning',
      message: smallTargets.length === 0 ? 'All touch targets meet minimum size' : `${smallTargets.length} touch targets below 44px`,
      details: { count: smallTargets.length, minSize: 44 }
    };
  };

  // Functionality testing
  const testTouchGestures = (): TestResult => {
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pointerSupported = 'onpointerdown' in window;
    
    return {
      testName: 'Touch Gestures',
      category: 'functionality',
      status: touchSupported || pointerSupported ? 'pass' : 'warning',
      message: touchSupported ? 'Touch events supported' : pointerSupported ? 'Pointer events supported' : 'Limited touch support',
      details: { touch: touchSupported, pointer: pointerSupported }
    };
  };

  const testKeyboardNavigation = (): TestResult => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const withoutTabIndex = Array.from(focusableElements).filter(el => 
      !el.hasAttribute('tabindex') && el.tagName !== 'A' && el.tagName !== 'BUTTON'
    );

    return {
      testName: 'Keyboard Navigation',
      category: 'accessibility',
      status: withoutTabIndex.length === 0 ? 'pass' : 'warning',
      message: withoutTabIndex.length === 0 ? 'All elements keyboard accessible' : `${withoutTabIndex.length} elements may not be keyboard accessible`,
      details: { totalFocusable: focusableElements.length, withoutTabIndex: withoutTabIndex.length }
    };
  };

  // Performance testing
  const testPageLoadTime = (): TestResult => {
    const { loadTime } = state.performanceMetrics;
    const threshold = state.browserInfo.mobile ? 
      TESTING_CONFIG.performanceThresholds.mobile.timeToInteractive :
      TESTING_CONFIG.performanceThresholds.desktop.timeToInteractive;
    
    return {
      testName: 'Page Load Time',
      category: 'performance',
      status: loadTime <= threshold ? 'pass' : loadTime <= threshold * 1.5 ? 'warning' : 'fail',
      message: `Page loaded in ${loadTime}ms (threshold: ${threshold}ms)`,
      details: { loadTime, threshold, device: state.browserInfo.mobile ? 'mobile' : 'desktop' }
    };
  };

  const testImageOptimization = (): TestResult => {
    const images = document.querySelectorAll('img');
    const unoptimized: Element[] = [];
    
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (!src.includes('?') && !src.endsWith('.webp') && !src.endsWith('.avif')) {
        unoptimized.push(img);
      }
    });

    return {
      testName: 'Image Optimization',
      category: 'performance',
      status: unoptimized.length === 0 ? 'pass' : 'warning',
      message: unoptimized.length === 0 ? 'All images optimized' : `${unoptimized.length} images could be optimized`,
      details: { total: images.length, unoptimized: unoptimized.length }
    };
  };

  // Run comprehensive compatibility test
  const runCompatibilityTest = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isRunningTests: true, testProgress: 0, testResults: [] }));

    const tests = [
      testResponsiveBreakpoints,
      testCSSGridLayout,
      testTouchTargets,
      testTouchGestures,
      testKeyboardNavigation,
      testPageLoadTime,
      testImageOptimization
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async testing
      
      try {
        const result = tests[i]();
        results.push(result);
      } catch (error) {
        results.push({
          testName: `Test ${i + 1}`,
          category: 'functionality',
          status: 'fail',
          message: `Test failed: ${error}`,
          details: { error: String(error) }
        });
      }
      
      setState(prev => ({
        ...prev,
        testProgress: Math.round(((i + 1) / tests.length) * 100),
        testResults: [...results]
      }));
    }

    const report = generateCompatibilityReport(results);
    
    setState(prev => ({
      ...prev,
      isRunningTests: false,
      testProgress: 100,
      compatibilityReport: report
    }));
  }, [state.browserInfo, state.performanceMetrics]);

  // Run specific test suite
  const runSpecificTest = useCallback(async (testSuite: TestSuite): Promise<TestResult[]> => {
    const suiteTests = TESTING_CONFIG.testSuites[testSuite];
    const results: TestResult[] = [];
    
    // Map test names to actual test functions
    const testMap: Record<string, () => TestResult> = {
      'responsive-breakpoints': testResponsiveBreakpoints,
      'css-grid-layout': testCSSGridLayout,
      'touch-targets': testTouchTargets,
      'touch-gestures': testTouchGestures,
      'keyboard-navigation': testKeyboardNavigation,
      'page-load-time': testPageLoadTime,
      'image-optimization': testImageOptimization
    };

    for (const testName of suiteTests.tests) {
      if (testMap[testName]) {
        const result = testMap[testName]();
        results.push(result);
      }
    }

    return results;
  }, []);

  // Generate compatibility report
  const generateCompatibilityReport = useCallback((testResults?: TestResult[]): CompatibilityReport => {
    const results = testResults || state.testResults;
    const passCount = results.filter(r => r.status === 'pass').length;
    const overallScore = Math.round((passCount / results.length) * 100);
    
    const criticalIssues = results
      .filter(r => r.status === 'fail')
      .map(r => r.message);
    
    const warnings = results
      .filter(r => r.status === 'warning')
      .map(r => r.message);
    
    const recommendations: string[] = [];
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical compatibility issues first');
    }
    if (state.polyfillsNeeded.length > 0) {
      recommendations.push('Consider adding polyfills for unsupported features');
    }
    if (warnings.length > 0) {
      recommendations.push('Review warnings for potential improvements');
    }

    return {
      browser: state.browserInfo,
      overallScore,
      criticalIssues,
      warnings,
      recommendations,
      polyfillsNeeded: state.polyfillsNeeded,
      testResults: results
    };
  }, [state.browserInfo, state.testResults, state.polyfillsNeeded]);

  // Get polyfill recommendations
  const getPolyfillRecommendations = useCallback((): string[] => {
    return state.polyfillsNeeded.map(feature => {
      const polyfill = POLYFILLS[feature as keyof typeof POLYFILLS];
      return polyfill ? `${polyfill.name} (${polyfill.size})` : feature;
    });
  }, [state.polyfillsNeeded]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    runCompatibilityTest,
    runSpecificTest,
    generateReport: () => generateCompatibilityReport(),
    getPolyfillRecommendations
  };
}

// Hook for specific browser feature testing
export function useBrowserFeatureSupport(feature: keyof BrowserFeatures): {
  supported: boolean;
  needsPolyfill: boolean;
  polyfillInfo?: typeof POLYFILLS[keyof typeof POLYFILLS];
} {
  const [support, setSupport] = useState({
    supported: true,
    needsPolyfill: false,
    polyfillInfo: undefined as typeof POLYFILLS[keyof typeof POLYFILLS] | undefined
  });

  useEffect(() => {
    const browserInfo = BROWSER_DETECTION.detectBrowser();
    const supported = browserInfo.features[feature];
    const needsPolyfill = !supported && feature in POLYFILLS;
    const polyfillInfo = needsPolyfill ? POLYFILLS[feature as keyof typeof POLYFILLS] : undefined;

    setSupport({ supported, needsPolyfill, polyfillInfo });
  }, [feature]);

  return support;
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    navigation: null as PerformanceNavigationTiming | null,
    paint: [] as PerformanceEntry[],
    resources: [] as PerformanceEntry[],
    memory: null as any
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource').slice(-10); // Last 10 resources
      const memory = (performance as any).memory || null;

      setMetrics({ navigation, paint, resources, memory });
    };

    updateMetrics();
    
    // Update metrics periodically
    const interval = setInterval(updateMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

export default useCrossBrowserTesting;
