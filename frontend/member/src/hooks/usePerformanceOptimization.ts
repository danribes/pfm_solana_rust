import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PERFORMANCE_BUDGETS,
  CONNECTION_STRATEGIES,
  IMAGE_OPTIMIZATION,
  PERFORMANCE_METRICS,
  CACHE_STRATEGIES,
  RESOURCE_HINTS,
  ConnectionType,
  DeviceCategory
} from './performance-optimization';

interface PerformanceState {
  // Connection information
  connectionType: ConnectionType;
  effectiveConnectionType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  
  // Device classification
  deviceCategory: DeviceCategory;
  performanceBudget: typeof PERFORMANCE_BUDGETS.mobile;
  
  // Loading optimization
  shouldOptimizeImages: boolean;
  shouldLazyLoad: boolean;
  shouldPrefetch: boolean;
  imageQuality: number;
  
  // Performance metrics
  performanceMetrics: {
    fcp: number | null;
    lcp: number | null;
    cls: number | null;
    fid: number | null;
    tti: number | null;
  };
  
  // Cache status
  cacheEnabled: boolean;
  serviceWorkerSupported: boolean;
  
  // Loading states
  isSlowConnection: boolean;
  isDataSaver: boolean;
  performanceScore: number;
}

export function usePerformanceOptimization(): PerformanceState {
  const [state, setState] = useState<PerformanceState>(() => {
    if (typeof window === 'undefined') {
      return {
        connectionType: 'unknown',
        effectiveConnectionType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        deviceCategory: 'desktop',
        performanceBudget: PERFORMANCE_BUDGETS.desktop,
        shouldOptimizeImages: false,
        shouldLazyLoad: true,
        shouldPrefetch: true,
        imageQuality: 85,
        performanceMetrics: {
          fcp: null,
          lcp: null,
          cls: null,
          fid: null,
          tti: null
        },
        cacheEnabled: false,
        serviceWorkerSupported: false,
        isSlowConnection: false,
        isDataSaver: false,
        performanceScore: 100
      };
    }

    // Detect connection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const effectiveType = connection?.effectiveType || '4g';
    const downlink = connection?.downlink || 10;
    const rtt = connection?.rtt || 100;
    const saveData = connection?.saveData || false;
    
    // Classify connection type
    let connectionType: ConnectionType = 'unknown';
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      connectionType = 'slow';
    } else if (effectiveType === '3g') {
      connectionType = 'medium';
    } else if (effectiveType === '4g' || effectiveType === '5g') {
      connectionType = 'fast';
    }
    
    // Classify device
    const screenWidth = window.innerWidth;
    let deviceCategory: DeviceCategory = 'desktop';
    if (screenWidth <= 767) {
      deviceCategory = 'mobile';
    } else if (screenWidth <= 1024) {
      deviceCategory = 'tablet';
    } else if (screenWidth >= 1680) {
      deviceCategory = 'large';
    }
    
    const performanceBudget = PERFORMANCE_BUDGETS[deviceCategory];
    const connectionStrategy = CONNECTION_STRATEGIES[connectionType];
    
    return {
      connectionType,
      effectiveConnectionType: effectiveType,
      downlink,
      rtt,
      saveData,
      deviceCategory,
      performanceBudget,
      shouldOptimizeImages: connectionType === 'slow' || connectionType === 'medium' || saveData,
      shouldLazyLoad: true,
      shouldPrefetch: connectionType === 'fast' && !saveData,
      imageQuality: connectionStrategy.imageQuality,
      performanceMetrics: {
        fcp: null,
        lcp: null,
        cls: null,
        fid: null,
        tti: null
      },
      cacheEnabled: 'caches' in window,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      isSlowConnection: connectionType === 'slow' || downlink < 1.5,
      isDataSaver: saveData,
      performanceScore: 100
    };
  });

  // Performance metrics collection
  const collectPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const paintEntries = performance.getEntriesByType('paint');
    const navigationEntries = performance.getEntriesByType('navigation');
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');

    // First Contentful Paint
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    const fcp = fcpEntry ? fcpEntry.startTime : null;

    // Largest Contentful Paint
    let lcp: number | null = null;
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            lcp = lastEntry.startTime;
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for browsers without LCP support
        lcp = null;
      }
    }

    // Cumulative Layout Shift
    let cls = 0;
    layoutShiftEntries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });

    // Time to Interactive (approximation)
    const navigationEntry = navigationEntries[0] as any;
    const tti = navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.fetchStart : null;

    setState(prev => ({
      ...prev,
      performanceMetrics: {
        fcp,
        lcp,
        cls,
        fid: prev.performanceMetrics.fid, // FID requires user interaction
        tti
      }
    }));
  }, []);

  // Monitor connection changes
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const handleConnectionChange = () => {
      const effectiveType = connection.effectiveType || '4g';
      const downlink = connection.downlink || 10;
      const rtt = connection.rtt || 100;
      const saveData = connection.saveData || false;
      
      let connectionType: ConnectionType = 'unknown';
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        connectionType = 'slow';
      } else if (effectiveType === '3g') {
        connectionType = 'medium';
      } else if (effectiveType === '4g' || effectiveType === '5g') {
        connectionType = 'fast';
      }
      
      const connectionStrategy = CONNECTION_STRATEGIES[connectionType];
      
      setState(prev => ({
        ...prev,
        connectionType,
        effectiveConnectionType: effectiveType,
        downlink,
        rtt,
        saveData,
        shouldOptimizeImages: connectionType === 'slow' || connectionType === 'medium' || saveData,
        shouldPrefetch: connectionType === 'fast' && !saveData,
        imageQuality: connectionStrategy.imageQuality,
        isSlowConnection: connectionType === 'slow' || downlink < 1.5,
        isDataSaver: saveData
      }));
    };

    connection.addEventListener('change', handleConnectionChange);
    return () => {
      connection.removeEventListener('change', handleConnectionChange);
    };
  }, []);

  // Collect performance metrics on load
  useEffect(() => {
    // Wait for page to load before collecting metrics
    if (document.readyState === 'complete') {
      setTimeout(collectPerformanceMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectPerformanceMetrics, 1000);
      });
    }
  }, [collectPerformanceMetrics]);

  return state;
}

// Hook for lazy loading images
export function useLazyLoading() {
  const performanceState = usePerformanceOptimization();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!performanceState.shouldLazyLoad || typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              setLoadedImages(prev => new Set(prev).add(src));
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: IMAGE_OPTIMIZATION.lazyLoading.rootMargin,
        threshold: IMAGE_OPTIMIZATION.lazyLoading.threshold
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [performanceState.shouldLazyLoad]);

  const registerLazyImage = useCallback((element: HTMLImageElement) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  return { registerLazyImage, loadedImages };
}

// Hook for resource prefetching
export function useResourcePrefetch() {
  const performanceState = usePerformanceOptimization();
  const [prefetchedUrls, setPrefetchedUrls] = useState<Set<string>>(new Set());

  const prefetchResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'document' = 'document') => {
    if (!performanceState.shouldPrefetch || prefetchedUrls.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (type !== 'document') {
      link.as = type;
    }
    
    link.onload = () => {
      setPrefetchedUrls(prev => new Set(prev).add(url));
    };
    
    document.head.appendChild(link);
  }, [performanceState.shouldPrefetch, prefetchedUrls]);

  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'font') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }, []);

  return { prefetchResource, preloadResource, prefetchedUrls };
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    setIsMonitoring(true);
    
    // Collect metrics periodically
    const interval = setInterval(() => {
      const performanceData = {
        timestamp: Date.now(),
        navigation: performance.getEntriesByType('navigation')[0],
        paint: performance.getEntriesByType('paint'),
        resources: performance.getEntriesByType('resource').slice(-10), // Last 10 resources
        memory: (performance as any).memory || null
      };
      
      setMetrics(prev => [...prev.slice(-19), performanceData]); // Keep last 20 entries
    }, PERFORMANCE_METRICS.monitoring.reportingInterval);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, []);

  const getPerformanceScore = useCallback(() => {
    if (metrics.length === 0) return 100;

    const latestMetrics = metrics[metrics.length - 1];
    const navigation = latestMetrics.navigation as any;
    
    if (!navigation) return 100;

    // Simple scoring based on load time
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    const score = Math.max(0, 100 - (loadTime / 50)); // Lose 1 point per 50ms
    
    return Math.round(score);
  }, [metrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    getPerformanceScore
  };
}

// Hook for critical resource management
export function useCriticalResources() {
  const performanceState = usePerformanceOptimization();
  const [criticalLoaded, setCriticalLoaded] = useState(false);
  const [nonCriticalLoaded, setNonCriticalLoaded] = useState(false);

  const loadCriticalResources = useCallback(async () => {
    // Load critical CSS inline
    const criticalCSS = `
      /* Critical above-the-fold styles */
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
      .header { background: #fff; border-bottom: 1px solid #e5e5e5; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 200px; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
    
    setCriticalLoaded(true);
  }, []);

  const loadNonCriticalResources = useCallback(() => {
    if (!performanceState.shouldPrefetch) return;

    // Load non-critical resources after main content
    setTimeout(() => {
      setNonCriticalLoaded(true);
    }, 2000);
  }, [performanceState.shouldPrefetch]);

  useEffect(() => {
    loadCriticalResources();
    
    // Load non-critical resources after page load
    if (document.readyState === 'complete') {
      loadNonCriticalResources();
    } else {
      window.addEventListener('load', loadNonCriticalResources);
      return () => window.removeEventListener('load', loadNonCriticalResources);
    }
  }, [loadCriticalResources, loadNonCriticalResources]);

  return { criticalLoaded, nonCriticalLoaded };
}
