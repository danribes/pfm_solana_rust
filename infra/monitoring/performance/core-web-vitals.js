// Task 6.6.4: CDN Integration & Performance Optimization
// Core Web Vitals Tracking and Performance Monitoring

class CoreWebVitalsTracker {
    constructor(config = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/performance/metrics',
            sampleRate: config.sampleRate || 0.1,
            batchSize: config.batchSize || 10,
            flushInterval: config.flushInterval || 30000, // 30 seconds
            maxRetries: config.maxRetries || 3,
            debug: config.debug || false,
            ...config
        };
        
        this.metrics = [];
        this.batchQueue = [];
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        this.retryCount = 0;
        
        // Initialize tracking
        this.init();
    }
    
    init() {
        // Check if we should collect metrics for this user
        if (Math.random() > this.config.sampleRate) {
            this.log('Sampling excluded this session');
            return;
        }
        
        // Wait for page to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startTracking());
        } else {
            this.startTracking();
        }
        
        // Set up periodic flushing
        setInterval(() => this.flushMetrics(), this.config.flushInterval);
        
        // Flush on page unload
        window.addEventListener('beforeunload', () => this.flushMetrics(true));
        window.addEventListener('pagehide', () => this.flushMetrics(true));
    }
    
    startTracking() {
        this.log('Starting Core Web Vitals tracking');
        
        // Track Core Web Vitals
        this.trackLCP();
        this.trackFID();
        this.trackCLS();
        this.trackFCP();
        this.trackTTFB();
        
        // Track additional performance metrics
        this.trackNavigationTiming();
        this.trackResourceTiming();
        this.trackNetworkInformation();
        
        // Track user interactions
        this.trackUserInteractions();
        
        // Track JavaScript errors
        this.trackJavaScriptErrors();
    }
    
    trackLCP() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.recordMetric('lcp', {
                    value: lastEntry.startTime,
                    element: lastEntry.element?.tagName || 'unknown',
                    url: lastEntry.url || '',
                    timestamp: Date.now()
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            this.log('Error tracking LCP:', error);
        }
    }
    
    trackFID() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.recordMetric('fid', {
                        value: entry.processingStart - entry.startTime,
                        name: entry.name,
                        timestamp: Date.now()
                    });
                }
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            this.log('Error tracking FID:', error);
        }
    }
    
    trackCLS() {
        if (!('PerformanceObserver' in window)) return;
        
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        
        try {
            const observer = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                        
                        if (sessionValue && 
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += entry.value;
                            sessionEntries.push(entry);
                        } else {
                            sessionValue = entry.value;
                            sessionEntries = [entry];
                        }
                        
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            
                            this.recordMetric('cls', {
                                value: clsValue,
                                entries: sessionEntries.length,
                                timestamp: Date.now()
                            });
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            this.log('Error tracking CLS:', error);
        }
    }
    
    trackFCP() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('fcp', {
                            value: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                }
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (error) {
            this.log('Error tracking FCP:', error);
        }
    }
    
    trackTTFB() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                
                this.recordMetric('ttfb', {
                    value: ttfb,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            this.log('Error tracking TTFB:', error);
        }
    }
    
    trackNavigationTiming() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                this.recordMetric('navigation', {
                    dns_lookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
                    tcp_connect: navigationEntry.connectEnd - navigationEntry.connectStart,
                    ssl_handshake: navigationEntry.connectEnd - navigationEntry.secureConnectionStart,
                    request_time: navigationEntry.responseStart - navigationEntry.requestStart,
                    response_time: navigationEntry.responseEnd - navigationEntry.responseStart,
                    dom_processing: navigationEntry.domContentLoadedEventStart - navigationEntry.responseEnd,
                    dom_complete: navigationEntry.domComplete - navigationEntry.domContentLoadedEventStart,
                    load_complete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            this.log('Error tracking navigation timing:', error);
        }
    }
    
    trackResourceTiming() {
        try {
            const resourceEntries = performance.getEntriesByType('resource');
            const resourceSummary = {
                total_resources: resourceEntries.length,
                total_size: 0,
                resource_types: {},
                slow_resources: [],
                timestamp: Date.now()
            };
            
            resourceEntries.forEach(entry => {
                const duration = entry.responseEnd - entry.startTime;
                const size = entry.transferSize || 0;
                
                resourceSummary.total_size += size;
                
                // Count by type
                const type = this.getResourceType(entry.name);
                resourceSummary.resource_types[type] = (resourceSummary.resource_types[type] || 0) + 1;
                
                // Track slow resources (>1s)
                if (duration > 1000) {
                    resourceSummary.slow_resources.push({
                        name: entry.name,
                        duration: duration,
                        size: size
                    });
                }
            });
            
            this.recordMetric('resources', resourceSummary);
        } catch (error) {
            this.log('Error tracking resource timing:', error);
        }
    }
    
    trackNetworkInformation() {
        try {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                
                this.recordMetric('network', {
                    effective_type: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    save_data: connection.saveData,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            this.log('Error tracking network information:', error);
        }
    }
    
    trackUserInteractions() {
        let interactionCount = 0;
        let firstInteractionTime = null;
        
        const trackInteraction = (event) => {
            if (!firstInteractionTime) {
                firstInteractionTime = Date.now();
            }
            interactionCount++;
        };
        
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, trackInteraction, { passive: true });
        });
        
        // Report interactions periodically
        setInterval(() => {
            if (interactionCount > 0) {
                this.recordMetric('interactions', {
                    count: interactionCount,
                    first_interaction: firstInteractionTime,
                    timestamp: Date.now()
                });
                interactionCount = 0;
            }
        }, 30000); // Every 30 seconds
    }
    
    trackJavaScriptErrors() {
        window.addEventListener('error', (event) => {
            this.recordMetric('js_error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack || '',
                timestamp: Date.now()
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.recordMetric('promise_rejection', {
                reason: event.reason?.toString() || 'Unknown rejection',
                timestamp: Date.now()
            });
        });
    }
    
    recordMetric(name, data) {
        const metric = {
            id: this.generateId(),
            name: name,
            data: data,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            session_id: this.sessionId,
            page_load_time: this.pageLoadTime,
            timestamp: Date.now()
        };
        
        this.metrics.push(metric);
        this.log('Recorded metric:', name, data);
        
        // Auto-flush if batch is full
        if (this.metrics.length >= this.config.batchSize) {
            this.flushMetrics();
        }
    }
    
    flushMetrics(immediate = false) {
        if (this.metrics.length === 0) return;
        
        const batch = [...this.metrics];
        this.metrics = [];
        
        this.log('Flushing', batch.length, 'metrics');
        
        const payload = {
            batch_id: this.generateId(),
            session_id: this.sessionId,
            metrics: batch,
            metadata: {
                url: window.location.href,
                referrer: document.referrer,
                timestamp: Date.now(),
                user_agent: navigator.userAgent
            }
        };
        
        if (immediate && 'sendBeacon' in navigator) {
            // Use sendBeacon for reliable delivery during page unload
            navigator.sendBeacon(
                this.config.apiEndpoint,
                JSON.stringify(payload)
            );
        } else {
            // Use fetch for regular flushing
            this.sendMetrics(payload);
        }
    }
    
    async sendMetrics(payload) {
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.log('Metrics sent successfully');
            this.retryCount = 0;
        } catch (error) {
            this.log('Error sending metrics:', error);
            
            // Retry with exponential backoff
            if (this.retryCount < this.config.maxRetries) {
                this.retryCount++;
                const delay = Math.pow(2, this.retryCount) * 1000;
                
                setTimeout(() => {
                    this.sendMetrics(payload);
                }, delay);
            }
        }
    }
    
    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        
        if (['js', 'mjs'].includes(extension)) return 'script';
        if (['css'].includes(extension)) return 'stylesheet';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(extension)) return 'image';
        if (['woff', 'woff2', 'ttf', 'eot'].includes(extension)) return 'font';
        if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
        if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
        if (url.includes('/api/')) return 'api';
        
        return 'other';
    }
    
    generateSessionId() {
        return 'cwv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    log(...args) {
        if (this.config.debug) {
            console.log('[CoreWebVitals]', ...args);
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreWebVitalsTracker;
}

// Global instance for direct usage
if (typeof window !== 'undefined') {
    window.CoreWebVitalsTracker = CoreWebVitalsTracker;
    
    // Auto-initialize if config is available
    if (window.cwvConfig) {
        window.cwvTracker = new CoreWebVitalsTracker(window.cwvConfig);
    }
}
