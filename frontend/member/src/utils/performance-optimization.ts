// Performance Optimization & Loading System
// Task 4.6.1 Sub-task 4 - Advanced performance optimization for mobile-first responsive design

export interface PerformanceConfig {
  // Connection awareness
  connectionTypes: string[];
  slowConnectionThreshold: number;
  dataUsageThreshold: number;
  
  // Loading strategies
  lazyLoadingEnabled: boolean;
  criticalCssInline: boolean;
  progressiveImageLoading: boolean;
  prefetchEnabled: boolean;
  
  // Optimization thresholds
  imageCompressionQuality: number;
  bundleSplittingEnabled: boolean;
  treeshakingEnabled: boolean;
  cacheStrategy: string;
}

export interface LoadingStrategy {
  priority: 'high' | 'medium' | 'low' | 'idle';
  timing: 'immediate' | 'on-interaction' | 'on-viewport' | 'on-idle';
  threshold: number;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  timeout: number;
}

// Performance budgets for different device categories
export const PERFORMANCE_BUDGETS = {
  mobile: {
    // Network budgets
    totalSize: 1500,      // 1.5MB total page size
    imageSize: 800,       // 800KB for images
    scriptSize: 400,      // 400KB for JavaScript
    cssSize: 100,         // 100KB for CSS
    fontSize: 200,        // 200KB for fonts
    
    // Time budgets (ms)
    firstContentfulPaint: 2000,    // 2s FCP
    largestContentfulPaint: 4000,  // 4s LCP
    firstInputDelay: 300,          // 300ms FID
    cumulativeLayoutShift: 0.25,   // 0.25 CLS
    timeToInteractive: 5000,       // 5s TTI
    
    // Connection considerations
    slowConnectionMultiplier: 2.0,
    fastConnectionMultiplier: 0.7
  },
  
  tablet: {
    totalSize: 2000,      // 2MB total page size
    imageSize: 1200,      // 1.2MB for images
    scriptSize: 500,      // 500KB for JavaScript
    cssSize: 150,         // 150KB for CSS
    fontSize: 250,        // 250KB for fonts
    
    firstContentfulPaint: 1800,
    largestContentfulPaint: 3500,
    firstInputDelay: 200,
    cumulativeLayoutShift: 0.20,
    timeToInteractive: 4000,
    
    slowConnectionMultiplier: 1.8,
    fastConnectionMultiplier: 0.8
  },
  
  desktop: {
    totalSize: 3000,      // 3MB total page size
    imageSize: 1800,      // 1.8MB for images
    scriptSize: 700,      // 700KB for JavaScript
    cssSize: 200,         // 200KB for CSS
    fontSize: 300,        // 300KB for fonts
    
    firstContentfulPaint: 1500,
    largestContentfulPaint: 3000,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.15,
    timeToInteractive: 3000,
    
    slowConnectionMultiplier: 1.5,
    fastConnectionMultiplier: 0.9
  },
  
  large: {
    totalSize: 4000,      // 4MB total page size
    imageSize: 2500,      // 2.5MB for images
    scriptSize: 900,      // 900KB for JavaScript
    cssSize: 250,         // 250KB for CSS
    fontSize: 350,        // 350KB for fonts
    
    firstContentfulPaint: 1200,
    largestContentfulPaint: 2500,
    firstInputDelay: 50,
    cumulativeLayoutShift: 0.10,
    timeToInteractive: 2500,
    
    slowConnectionMultiplier: 1.3,
    fastConnectionMultiplier: 1.0
  }
} as const;

// Connection-aware loading strategies
export const CONNECTION_STRATEGIES = {
  // Slow connections (2G, slow-2g)
  slow: {
    imageQuality: 60,         // 60% JPEG quality
    enableWebP: true,         // Use WebP when supported
    lazyLoadThreshold: 50,    // Load when 50px from viewport
    prefetchDisabled: true,   // Disable prefetching
    bundleSplitting: true,    // Aggressive code splitting
    criticalOnly: true,       // Load critical resources only
    compressionLevel: 9,      // Maximum compression
    cacheAggressive: true     // Aggressive caching
  },
  
  // Medium connections (3g)
  medium: {
    imageQuality: 75,
    enableWebP: true,
    lazyLoadThreshold: 100,
    prefetchDisabled: false,
    bundleSplitting: true,
    criticalOnly: false,
    compressionLevel: 7,
    cacheAggressive: true
  },
  
  // Fast connections (4g, 5g)
  fast: {
    imageQuality: 85,
    enableWebP: true,
    lazyLoadThreshold: 200,
    prefetchDisabled: false,
    bundleSplitting: false,
    criticalOnly: false,
    compressionLevel: 5,
    cacheAggressive: false
  },
  
  // Unknown connection
  unknown: {
    imageQuality: 70,
    enableWebP: true,
    lazyLoadThreshold: 100,
    prefetchDisabled: true,
    bundleSplitting: true,
    criticalOnly: false,
    compressionLevel: 7,
    cacheAggressive: true
  }
} as const;

// Critical resource identification
export const CRITICAL_RESOURCES = {
  // Above-the-fold critical CSS
  criticalCSS: [
    'layout.css',
    'typography.css',
    'colors.css',
    'responsive.css'
  ],
  
  // Critical JavaScript
  criticalJS: [
    'polyfills.js',
    'critical-path.js',
    'render-blocking.js'
  ],
  
  // Critical images (hero, logo, etc.)
  criticalImages: {
    hero: { priority: 'high', format: 'webp', fallback: 'jpg' },
    logo: { priority: 'high', format: 'svg', fallback: 'png' },
    navigation: { priority: 'medium', format: 'svg', fallback: 'png' }
  },
  
  // Non-critical resources
  nonCritical: [
    'analytics.js',
    'social-widgets.js',
    'comments.js',
    'advertising.js',
    'below-fold-images'
  ]
};

// Image optimization strategies
export const IMAGE_OPTIMIZATION = {
  // Responsive image breakpoints
  breakpoints: [320, 480, 768, 1024, 1366, 1920, 2560],
  
  // Format preferences by device type
  formats: {
    mobile: ['webp', 'jpg', 'png'],
    tablet: ['webp', 'jpg', 'png'],
    desktop: ['webp', 'jpg', 'png', 'avif']
  },
  
  // Quality settings by connection
  quality: {
    '2g': { webp: 50, jpg: 60, png: 70 },
    '3g': { webp: 65, jpg: 75, png: 85 },
    '4g': { webp: 80, jpg: 85, png: 90 },
    'fast': { webp: 85, jpg: 90, png: 95 }
  },
  
  // Lazy loading configuration
  lazyLoading: {
    rootMargin: '50px',       // Load 50px before entering viewport
    threshold: 0.1,           // 10% visible triggers load
    enableNative: true,       // Use native lazy loading when available
    fallbackEnabled: true,    // JavaScript fallback for older browsers
    placeholderStrategy: 'blur' // Blur placeholder while loading
  },
  
  // Progressive loading
  progressiveLoading: {
    enabled: true,
    lowQualityFirst: true,    // Load low-quality version first
    transitionDuration: 300,  // Fade-in duration (ms)
    retryAttempts: 3,         // Retry failed loads
    timeoutMs: 10000          // 10s timeout
  }
};

// Performance monitoring and metrics
export const PERFORMANCE_METRICS = {
  // Core Web Vitals
  coreWebVitals: {
    LCP: { good: 2500, needsImprovement: 4000 },      // Largest Contentful Paint
    FID: { good: 100, needsImprovement: 300 },        // First Input Delay
    CLS: { good: 0.1, needsImprovement: 0.25 },       // Cumulative Layout Shift
    FCP: { good: 1800, needsImprovement: 3000 },      // First Contentful Paint
    TTI: { good: 3800, needsImprovement: 7300 }       // Time to Interactive
  },
  
  // Custom metrics
  customMetrics: {
    timeToFirstByte: { good: 800, needsImprovement: 1800 },
    domContentLoaded: { good: 1600, needsImprovement: 3000 },
    loadComplete: { good: 3200, needsImprovement: 5000 },
    resourceLoadTime: { good: 2000, needsImprovement: 4000 }
  },
  
  // Monitoring configuration
  monitoring: {
    sampleRate: 0.1,          // Monitor 10% of sessions
    reportingInterval: 30000, // Report every 30 seconds
    batchSize: 10,           // Batch 10 metrics per report
    enableRUM: true,         // Real User Monitoring
    enableSynthetic: false   // Synthetic monitoring (disable in demo)
  }
};

// Caching strategies
export const CACHE_STRATEGIES = {
  // Service Worker caching
  serviceWorker: {
    enabled: true,
    strategy: 'stale-while-revalidate',
    maxAge: 86400,           // 24 hours
    maxEntries: 100,         // Maximum cache entries
    purgeOnQuotaError: true  // Purge when quota exceeded
  },
  
  // Browser caching
  browserCache: {
    css: { maxAge: 31536000, strategy: 'immutable' },      // 1 year
    js: { maxAge: 31536000, strategy: 'immutable' },       // 1 year
    images: { maxAge: 2592000, strategy: 'stale-while-revalidate' }, // 30 days
    fonts: { maxAge: 31536000, strategy: 'immutable' },    // 1 year
    html: { maxAge: 3600, strategy: 'no-cache' }           // 1 hour, always revalidate
  },
  
  // CDN caching
  cdn: {
    enabled: false,          // Disabled for demo
    provider: 'cloudflare',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    cacheRules: {
      static: 31536000,      // 1 year for static assets
      dynamic: 3600,         // 1 hour for dynamic content
      api: 300              // 5 minutes for API responses
    }
  }
};

// Resource hints and preloading
export const RESOURCE_HINTS = {
  // DNS prefetch for external domains
  dnsPrefetch: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//cdn.jsdelivr.net'
  ],
  
  // Preconnect to critical domains
  preconnect: [
    'https://fonts.googleapis.com',
    'https://api.example.com'
  ],
  
  // Preload critical resources
  preload: {
    fonts: [
      { href: '/fonts/inter-var.woff2', type: 'font/woff2', crossorigin: 'anonymous' }
    ],
    images: [
      { href: '/images/hero.webp', type: 'image/webp', as: 'image' }
    ],
    scripts: [
      { href: '/js/critical.js', type: 'text/javascript', as: 'script' }
    ]
  },
  
  // Prefetch likely next pages
  prefetch: {
    enabled: true,
    strategy: 'intersection-observer',
    threshold: 0.5,          // Prefetch when 50% visible
    delay: 2000,             // 2s delay before prefetch
    maxConcurrent: 3         // Maximum concurrent prefetches
  }
};

// Bundle optimization
export const BUNDLE_OPTIMIZATION = {
  // Code splitting configuration
  codeSplitting: {
    enabled: true,
    strategy: 'route-based',     // Split by routes
    chunkSize: {
      min: 20000,               // 20KB minimum chunk size
      max: 200000,              // 200KB maximum chunk size
      target: 100000            // 100KB target chunk size
    }
  },
  
  // Tree shaking
  treeShaking: {
    enabled: true,
    sideEffects: false,         // Mark as side-effect free
    unusedExports: true,        // Remove unused exports
    deadCode: true              // Remove dead code
  },
  
  // Minification
  minification: {
    enabled: true,
    css: { minify: true, purge: true },
    js: { minify: true, mangle: true, compress: true },
    html: { minify: true, removeComments: true },
    images: { optimize: true, progressive: true }
  },
  
  // Compression
  compression: {
    gzip: { enabled: true, level: 6 },
    brotli: { enabled: true, level: 4 },
    threshold: 1024             // Compress files > 1KB
  }
};

export type ConnectionType = keyof typeof CONNECTION_STRATEGIES;
export type DeviceCategory = keyof typeof PERFORMANCE_BUDGETS;
export type CacheStrategy = keyof typeof CACHE_STRATEGIES;
export type ResourceType = 'css' | 'js' | 'images' | 'fonts' | 'html';
