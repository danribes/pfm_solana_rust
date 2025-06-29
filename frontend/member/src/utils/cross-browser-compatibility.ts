// Cross-Browser Compatibility & Testing System
// Task 4.6.1 Sub-task 5 - Comprehensive browser compatibility and automated testing

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  supported: boolean;
  features: BrowserFeatures;
}

export interface BrowserFeatures {
  // CSS Features
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssCustomProperties: boolean;
  cssClamp: boolean;
  cssContainerQueries: boolean;
  
  // JavaScript Features
  es6Modules: boolean;
  async: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  serviceWorker: boolean;
  
  // Web APIs
  touchEvents: boolean;
  pointerEvents: boolean;
  deviceMotion: boolean;
  geolocation: boolean;
  localStorage: boolean;
  webgl: boolean;
  
  // Media Features
  webp: boolean;
  avif: boolean;
  svg: boolean;
  mediaqueries: boolean;
  
  // Progressive Web App
  appManifest: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  overallScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  polyfillsNeeded: string[];
  testResults: TestResult[];
}

export interface TestResult {
  testName: string;
  category: 'layout' | 'functionality' | 'performance' | 'accessibility';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

// Browser support matrix for our mobile-first responsive design
export const BROWSER_SUPPORT_MATRIX = {
  // Desktop browsers
  chrome: {
    minVersion: 88,
    features: {
      cssGrid: 88,
      cssFlexbox: 29,
      cssCustomProperties: 49,
      cssClamp: 79,
      cssContainerQueries: 105,
      intersectionObserver: 58,
      resizeObserver: 64,
      serviceWorker: 45
    }
  },
  
  firefox: {
    minVersion: 85,
    features: {
      cssGrid: 52,
      cssFlexbox: 28,
      cssCustomProperties: 31,
      cssClamp: 75,
      cssContainerQueries: 110,
      intersectionObserver: 55,
      resizeObserver: 69,
      serviceWorker: 44
    }
  },
  
  safari: {
    minVersion: 14,
    features: {
      cssGrid: 10.1,
      cssFlexbox: 9,
      cssCustomProperties: 9.1,
      cssClamp: 13.1,
      cssContainerQueries: 16,
      intersectionObserver: 12.1,
      resizeObserver: 13.1,
      serviceWorker: 11.1
    }
  },
  
  edge: {
    minVersion: 88,
    features: {
      cssGrid: 16,
      cssFlexbox: 12,
      cssCustomProperties: 15,
      cssClamp: 79,
      cssContainerQueries: 105,
      intersectionObserver: 15,
      resizeObserver: 79,
      serviceWorker: 17
    }
  },
  
  // Mobile browsers
  'chrome-mobile': {
    minVersion: 88,
    features: {
      cssGrid: 88,
      cssFlexbox: 29,
      touchEvents: 32,
      pointerEvents: 55,
      deviceMotion: 31,
      webp: 32,
      avif: 85
    }
  },
  
  'safari-mobile': {
    minVersion: 14,
    features: {
      cssGrid: 10.3,
      cssFlexbox: 9,
      touchEvents: 2,
      pointerEvents: 13,
      deviceMotion: 4.2,
      webp: 14,
      avif: false
    }
  },
  
  'firefox-mobile': {
    minVersion: 85,
    features: {
      cssGrid: 52,
      cssFlexbox: 28,
      touchEvents: 6,
      pointerEvents: 59,
      deviceMotion: 6,
      webp: 65,
      avif: 93
    }
  }
} as const;

// Polyfills and fallbacks configuration
export const POLYFILLS = {
  // CSS Polyfills
  cssGrid: {
    name: 'CSS Grid Polyfill',
    library: 'css-grid-polyfill',
    fallback: 'flexbox',
    size: '12KB',
    performance: 'minimal impact'
  },
  
  cssCustomProperties: {
    name: 'CSS Custom Properties Polyfill',
    library: 'css-vars-ponyfill',
    fallback: 'static values',
    size: '8KB',
    performance: 'low impact'
  },
  
  intersectionObserver: {
    name: 'Intersection Observer Polyfill',
    library: 'intersection-observer',
    fallback: 'scroll events',
    size: '5KB',
    performance: 'medium impact'
  },
  
  resizeObserver: {
    name: 'Resize Observer Polyfill',
    library: 'resize-observer-polyfill',
    fallback: 'resize events',
    size: '3KB',
    performance: 'low impact'
  },
  
  // JavaScript Polyfills
  fetch: {
    name: 'Fetch API Polyfill',
    library: 'whatwg-fetch',
    fallback: 'XMLHttpRequest',
    size: '4KB',
    performance: 'minimal impact'
  },
  
  promise: {
    name: 'Promise Polyfill',
    library: 'es6-promise',
    fallback: 'callbacks',
    size: '6KB',
    performance: 'minimal impact'
  }
} as const;

// Cross-browser testing configuration
export const TESTING_CONFIG = {
  // Automated testing browsers
  browsers: [
    { name: 'Chrome', versions: ['latest', 'latest-1', 'latest-2'] },
    { name: 'Firefox', versions: ['latest', 'latest-1'] },
    { name: 'Safari', versions: ['latest', 'latest-1'] },
    { name: 'Edge', versions: ['latest', 'latest-1'] },
    { name: 'Chrome Mobile', versions: ['latest'] },
    { name: 'Safari Mobile', versions: ['latest'] }
  ],
  
  // Test categories
  testSuites: {
    layout: {
      name: 'Layout & Responsive Design',
      tests: [
        'responsive-breakpoints',
        'css-grid-layout',
        'flexbox-alignment',
        'mobile-navigation',
        'touch-targets'
      ]
    },
    
    functionality: {
      name: 'Interactive Functionality',
      tests: [
        'touch-gestures',
        'keyboard-navigation',
        'form-validation',
        'modal-dialogs',
        'lazy-loading'
      ]
    },
    
    performance: {
      name: 'Performance & Loading',
      tests: [
        'page-load-time',
        'image-optimization',
        'critical-css',
        'javascript-execution',
        'memory-usage'
      ]
    },
    
    accessibility: {
      name: 'Accessibility Compliance',
      tests: [
        'screen-reader-compatibility',
        'keyboard-accessibility',
        'color-contrast',
        'aria-labels',
        'focus-management'
      ]
    }
  },
  
  // Performance thresholds
  performanceThresholds: {
    mobile: {
      firstContentfulPaint: 2500,
      largestContentfulPaint: 4000,
      timeToInteractive: 5000,
      cumulativeLayoutShift: 0.25
    },
    desktop: {
      firstContentfulPaint: 1500,
      largestContentfulPaint: 2500,
      timeToInteractive: 3000,
      cumulativeLayoutShift: 0.15
    }
  }
};

// Browser detection utilities
export const BROWSER_DETECTION = {
  // Detect browser name and version
  detectBrowser: (): BrowserInfo => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const mobile = /Mobile|Android|iP(hone|ad|od)/.test(userAgent);
    
    let name = 'unknown';
    let version = '0';
    let engine = 'unknown';
    
    // Chrome
    if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) {
      name = mobile ? 'chrome-mobile' : 'chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
      engine = 'blink';
    }
    // Safari
    else if (/Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor)) {
      name = mobile ? 'safari-mobile' : 'safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || '0';
      engine = 'webkit';
    }
    // Firefox
    else if (/Firefox/.test(userAgent)) {
      name = mobile ? 'firefox-mobile' : 'firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
      engine = 'gecko';
    }
    // Edge
    else if (/Edg/.test(userAgent)) {
      name = 'edge';
      version = userAgent.match(/Edg\/(\d+)/)?.[1] || '0';
      engine = 'blink';
    }
    
    const browserKey = name as keyof typeof BROWSER_SUPPORT_MATRIX;
    const supportInfo = BROWSER_SUPPORT_MATRIX[browserKey];
    const supported = supportInfo ? parseInt(version) >= supportInfo.minVersion : false;
    
    return {
      name,
      version,
      engine,
      platform,
      mobile,
      supported,
      features: detectFeatures()
    };
  },
  
  // Feature detection
  detectFeatures: (): BrowserFeatures => {
    const testElement = document.createElement('div');
    
    return {
      // CSS Features
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--test', '0'),
      cssClamp: CSS.supports('width', 'clamp(1px, 2px, 3px)'),
      cssContainerQueries: CSS.supports('container-type', 'inline-size'),
      
      // JavaScript Features
      es6Modules: 'noModule' in document.createElement('script'),
      async: 'async' in document.createElement('script'),
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      serviceWorker: 'serviceWorker' in navigator,
      
      // Web APIs
      touchEvents: 'ontouchstart' in window,
      pointerEvents: 'onpointerdown' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      geolocation: 'geolocation' in navigator,
      localStorage: 'localStorage' in window,
      webgl: !!document.createElement('canvas').getContext('webgl'),
      
      // Media Features
      webp: testImageFormat('webp'),
      avif: testImageFormat('avif'),
      svg: document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1'),
      mediaqueries: window.matchMedia('(min-width: 1px)').matches,
      
      // Progressive Web App
      appManifest: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };
  }
};

// Helper function to test image format support
function testImageFormat(format: string): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
}

// Feature detection for polyfills
function detectFeatures(): BrowserFeatures {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      cssGrid: true,
      cssFlexbox: true,
      cssCustomProperties: true,
      cssClamp: true,
      cssContainerQueries: false,
      es6Modules: true,
      async: true,
      intersectionObserver: true,
      resizeObserver: true,
      serviceWorker: true,
      touchEvents: false,
      pointerEvents: true,
      deviceMotion: false,
      geolocation: true,
      localStorage: true,
      webgl: true,
      webp: true,
      avif: false,
      svg: true,
      mediaqueries: true,
      appManifest: true,
      pushNotifications: true,
      backgroundSync: true
    };
  }
  
  return BROWSER_DETECTION.detectFeatures();
}

export type BrowserName = keyof typeof BROWSER_SUPPORT_MATRIX;
export type TestSuite = keyof typeof TESTING_CONFIG.testSuites;
export type PolyfillName = keyof typeof POLYFILLS;
