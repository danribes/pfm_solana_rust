const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Test Suite for Task 6.6.4: CDN Integration & Performance Optimization
 * 
 * This test suite validates the implementation of:
 * - CDN configuration and edge functions
 * - Asset optimization pipeline
 * - Cache management scripts
 * - Performance monitoring infrastructure
 * - Progressive Web App features
 */

// Test configuration
const TEST_CONFIG = {
    timeout: 30000,
    retries: 3,
    domains: [
        'pfm-community.app',
        'api.pfm-community.app', 
        'admin.pfm-community.app',
        'member.pfm-community.app'
    ]
};

// Test results tracking
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
};

// Logging functions
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function logSuccess(message) {
    console.log(`✓ ${message}`);
}

function logFail(message) {
    console.log(`✗ ${message}`);
}

function logError(message, error = null) {
    const errorMsg = error ? `${message}: ${error.message || error}` : message;
    console.error(`✗ ${errorMsg}`);
    testResults.errors.push({ message, error: error?.message || error });
}

// Test execution wrapper
function runTest(testName, testFunction) {
    testResults.total++;
    log(`Running test: ${testName}`);
    
    try {
        const result = testFunction();
        if (result === true) {
            testResults.passed++;
            logSuccess(`${testName} passed`);
            return true;
        } else {
            testResults.failed++;
            logFail(`${testName} failed`);
            return false;
        }
    } catch (error) {
        testResults.failed++;
        logError(`${testName} failed with error`, error);
        return false;
    }
}

// CDN Configuration Tests
function testCDNDirectoryStructure() {
    const requiredDirectories = [
        'infra/cdn/config',
        'infra/cdn/cache',
        'infra/cdn/edge-functions',
        'infra/cdn/security',
        'scripts/optimization',
        'scripts/cdn',
        'scripts/monitoring/performance',
        'infra/monitoring/performance',
        'frontend/pwa'
    ];
    
    for (const dir of requiredDirectories) {
        if (!fs.existsSync(dir)) {
            logError(`Required directory missing: ${dir}`);
            return false;
        }
    }
    
    return true;
}

function testCDNConfigurationFiles() {
    const requiredFiles = [
        'infra/cdn/config/cloudflare-config.yml',
        'infra/cdn/cache/cache-rules.yml',
        'infra/cdn/edge-functions/api-optimizer.js',
        'infra/cdn/edge-functions/asset-optimizer.js',
        'infra/cdn/security/security-rules.yml'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            logError(`Required CDN config file missing: ${file}`);
            return false;
        }
        
        // Check file content
        const content = fs.readFileSync(file, 'utf8');
        if (content.length < 100) {
            logError(`CDN config file appears empty or too small: ${file}`);
            return false;
        }
    }
    
    return true;
}

function testCloudflareConfiguration() {
    const configFile = 'infra/cdn/config/cloudflare-config.yml';
    
    try {
        const content = fs.readFileSync(configFile, 'utf8');
        
        // Check for required Cloudflare settings
        const requiredSettings = [
            'cloudflare:',
            'zones:',
            'settings:',
            'minify:',
            'ssl:',
            'page_rules:',
            'rate_limiting:'
        ];
        
        for (const setting of requiredSettings) {
            if (!content.includes(setting)) {
                logError(`Required Cloudflare setting missing: ${setting}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading Cloudflare configuration`, error);
        return false;
    }
}

function testCacheRulesConfiguration() {
    const configFile = 'infra/cdn/cache/cache-rules.yml';
    
    try {
        const content = fs.readFileSync(configFile, 'utf8');
        
        // Check for required cache rule types
        const requiredRules = [
            'static_assets:',
            'versioned_assets:',
            'html_pages:',
            'api_responses:',
            'dynamic_api:',
            'cache_warming:',
            'invalidation:'
        ];
        
        for (const rule of requiredRules) {
            if (!content.includes(rule)) {
                logError(`Required cache rule missing: ${rule}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading cache rules configuration`, error);
        return false;
    }
}

// Asset Optimization Tests
function testAssetOptimizationScripts() {
    const requiredScripts = [
        'scripts/optimization/asset-optimization.sh',
        'scripts/optimization/image-optimization.sh'
    ];
    
    for (const script of requiredScripts) {
        if (!fs.existsSync(script)) {
            logError(`Required asset optimization script missing: ${script}`);
            return false;
        }
        
        // Check if script is executable
        try {
            const stats = fs.statSync(script);
            if (!(stats.mode & parseInt('111', 8))) {
                logError(`Script not executable: ${script}`);
                return false;
            }
        } catch (error) {
            logError(`Error checking script permissions: ${script}`, error);
            return false;
        }
    }
    
    return true;
}

function testAssetOptimizationConfiguration() {
    const scriptFile = 'scripts/optimization/asset-optimization.sh';
    
    try {
        const content = fs.readFileSync(scriptFile, 'utf8');
        
        // Check for required optimization features
        const requiredFeatures = [
            'optimize_images()',
            'optimize_css()',
            'optimize_js()',
            'compress_file()',
            'generate_asset_manifest()',
            'IMAGE_QUALITY=',
            'WEBP_QUALITY=',
            'GZIP_COMPRESSION='
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required optimization feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading asset optimization script`, error);
        return false;
    }
}

function testImageOptimizationFeatures() {
    const scriptFile = 'scripts/optimization/image-optimization.sh';
    
    try {
        const content = fs.readFileSync(scriptFile, 'utf8');
        
        // Check for required image optimization features
        const requiredFeatures = [
            'optimize_jpeg()',
            'optimize_png()',
            'generate_webp()',
            'generate_avif()',
            'generate_responsive_versions()',
            'JPEG_QUALITY=',
            'WEBP_QUALITY=',
            'RESIZE_WIDTHS='
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required image optimization feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading image optimization script`, error);
        return false;
    }
}

// CDN Management Tests
function testCDNManagementScripts() {
    const requiredScripts = [
        'scripts/cdn/cache-invalidation.sh',
        'scripts/cdn/cache-warming.sh'
    ];
    
    for (const script of requiredScripts) {
        if (!fs.existsSync(script)) {
            logError(`Required CDN management script missing: ${script}`);
            return false;
        }
        
        // Check if script is executable
        try {
            const stats = fs.statSync(script);
            if (!(stats.mode & parseInt('111', 8))) {
                logError(`CDN script not executable: ${script}`);
                return false;
            }
        } catch (error) {
            logError(`Error checking CDN script permissions: ${script}`, error);
            return false;
        }
    }
    
    return true;
}

function testCacheInvalidationFeatures() {
    const scriptFile = 'scripts/cdn/cache-invalidation.sh';
    
    try {
        const content = fs.readFileSync(scriptFile, 'utf8');
        
        // Check for required cache invalidation features
        const requiredFeatures = [
            'purge_urls()',
            'purge_all()',
            'purge_tags()',
            'get_cache_analytics()',
            'CLOUDFLARE_API_TOKEN=',
            'CLOUDFLARE_ZONE_ID='
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required cache invalidation feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading cache invalidation script`, error);
        return false;
    }
}

function testCacheWarmingFeatures() {
    const scriptFile = 'scripts/cdn/cache-warming.sh';
    
    try {
        const content = fs.readFileSync(scriptFile, 'utf8');
        
        // Check for required cache warming features
        const requiredFeatures = [
            'warm_url()',
            'warm_popular_pages()',
            'warm_critical_assets()',
            'warm_sitemap_urls()',
            'POPULAR_PAGES=',
            'CRITICAL_ASSETS=',
            'CONCURRENT_REQUESTS='
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required cache warming feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading cache warming script`, error);
        return false;
    }
}

// Performance Monitoring Tests
function testPerformanceMonitoringConfig() {
    const configFile = 'infra/monitoring/performance/performance-monitoring.yml';
    
    if (!fs.existsSync(configFile)) {
        logError(`Performance monitoring config missing: ${configFile}`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(configFile, 'utf8');
        
        // Check for required monitoring features
        const requiredFeatures = [
            'core_web_vitals:',
            'performance_budgets:',
            'geographic_monitoring:',
            'rum:',
            'synthetic_monitoring:',
            'alerting:',
            'largest_contentful_paint:',
            'first_input_delay:',
            'cumulative_layout_shift:'
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required performance monitoring feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading performance monitoring config`, error);
        return false;
    }
}

function testCoreWebVitalsTracking() {
    const trackingFile = 'infra/monitoring/performance/core-web-vitals.js';
    
    if (!fs.existsSync(trackingFile)) {
        logError(`Core Web Vitals tracking missing: ${trackingFile}`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(trackingFile, 'utf8');
        
        // Check for required tracking features
        const requiredFeatures = [
            'class CoreWebVitalsTracker',
            'trackLCP()',
            'trackFID()',
            'trackCLS()',
            'trackFCP()',
            'trackTTFB()',
            'trackNavigationTiming()',
            'recordMetric(',
            'flushMetrics('
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required Core Web Vitals feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading Core Web Vitals tracking`, error);
        return false;
    }
}

function testPerformanceAuditScript() {
    const scriptFile = 'scripts/monitoring/performance/performance-audit.sh';
    
    if (!fs.existsSync(scriptFile)) {
        logError(`Performance audit script missing: ${scriptFile}`);
        return false;
    }
    
    try {
        const stats = fs.statSync(scriptFile);
        if (!(stats.mode & parseInt('111', 8))) {
            logError(`Performance audit script not executable: ${scriptFile}`);
            return false;
        }
        
        const content = fs.readFileSync(scriptFile, 'utf8');
        
        // Check for required audit features
        const requiredFeatures = [
            'run_lighthouse_audit()',
            'run_pagespeed_audit()',
            'check_core_web_vitals()',
            'generate_summary_report()',
            'PERFORMANCE_THRESHOLD=',
            'ACCESSIBILITY_THRESHOLD='
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required performance audit feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading performance audit script`, error);
        return false;
    }
}

// Progressive Web App Tests
function testPWAImplementation() {
    const requiredFiles = [
        'frontend/pwa/service-worker.js',
        'frontend/pwa/manifest.json'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            logError(`Required PWA file missing: ${file}`);
            return false;
        }
    }
    
    return true;
}

function testServiceWorkerFeatures() {
    const swFile = 'frontend/pwa/service-worker.js';
    
    try {
        const content = fs.readFileSync(swFile, 'utf8');
        
        // Check for required service worker features
        const requiredFeatures = [
            'addEventListener(\'install\'',
            'addEventListener(\'activate\'',
            'addEventListener(\'fetch\'',
            'addEventListener(\'message\'',
            'cacheFirst(',
            'networkFirst(',
            'staleWhileRevalidate(',
            'CACHE_STRATEGIES',
            'PRECACHE_ASSETS'
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required service worker feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading service worker`, error);
        return false;
    }
}

function testWebAppManifest() {
    const manifestFile = 'frontend/pwa/manifest.json';
    
    try {
        const content = fs.readFileSync(manifestFile, 'utf8');
        const manifest = JSON.parse(content);
        
        // Check for required manifest properties
        const requiredProperties = [
            'name',
            'short_name',
            'start_url',
            'display',
            'theme_color',
            'background_color',
            'icons',
            'shortcuts'
        ];
        
        for (const property of requiredProperties) {
            if (!(property in manifest)) {
                logError(`Required manifest property missing: ${property}`);
                return false;
            }
        }
        
        // Check icons array
        if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
            logError(`Manifest icons array is empty or invalid`);
            return false;
        }
        
        return true;
    } catch (error) {
        logError(`Error reading or parsing web app manifest`, error);
        return false;
    }
}

// Edge Functions Tests
function testEdgeFunctions() {
    const edgeFunctions = [
        'infra/cdn/edge-functions/api-optimizer.js',
        'infra/cdn/edge-functions/asset-optimizer.js'
    ];
    
    for (const func of edgeFunctions) {
        if (!fs.existsSync(func)) {
            logError(`Required edge function missing: ${func}`);
            return false;
        }
        
        try {
            const content = fs.readFileSync(func, 'utf8');
            
            // Check for required edge function features
            const requiredFeatures = [
                'addEventListener(\'fetch\'',
                'handleRequest(',
                'cache.match(',
                'response.clone()'
            ];
            
            for (const feature of requiredFeatures) {
                if (!content.includes(feature)) {
                    logError(`Required edge function feature missing in ${func}: ${feature}`);
                    return false;
                }
            }
        } catch (error) {
            logError(`Error reading edge function: ${func}`, error);
            return false;
        }
    }
    
    return true;
}

function testSecurityRulesConfiguration() {
    const securityFile = 'infra/cdn/security/security-rules.yml';
    
    try {
        const content = fs.readFileSync(securityFile, 'utf8');
        
        // Check for required security features
        const requiredFeatures = [
            'rate_limiting:',
            'bot_management:',
            'ddos_protection:',
            'content_security:',
            'ssl_security:',
            'security_headers:'
        ];
        
        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                logError(`Required security feature missing: ${feature}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading security rules configuration`, error);
        return false;
    }
}

// Main test runner
function runAllTests() {
    log('Starting CDN Integration & Performance Optimization tests...');
    log('='.repeat(60));
    
    // CDN Configuration tests
    runTest('CDN Directory Structure', testCDNDirectoryStructure);
    runTest('CDN Configuration Files', testCDNConfigurationFiles);
    runTest('Cloudflare Configuration', testCloudflareConfiguration);
    runTest('Cache Rules Configuration', testCacheRulesConfiguration);
    
    // Asset Optimization tests
    runTest('Asset Optimization Scripts', testAssetOptimizationScripts);
    runTest('Asset Optimization Configuration', testAssetOptimizationConfiguration);
    runTest('Image Optimization Features', testImageOptimizationFeatures);
    
    // CDN Management tests
    runTest('CDN Management Scripts', testCDNManagementScripts);
    runTest('Cache Invalidation Features', testCacheInvalidationFeatures);
    runTest('Cache Warming Features', testCacheWarmingFeatures);
    
    // Performance Monitoring tests
    runTest('Performance Monitoring Config', testPerformanceMonitoringConfig);
    runTest('Core Web Vitals Tracking', testCoreWebVitalsTracking);
    runTest('Performance Audit Script', testPerformanceAuditScript);
    
    // Progressive Web App tests
    runTest('PWA Implementation', testPWAImplementation);
    runTest('Service Worker Features', testServiceWorkerFeatures);
    runTest('Web App Manifest', testWebAppManifest);
    
    // Edge Functions and Security tests
    runTest('Edge Functions', testEdgeFunctions);
    runTest('Security Rules Configuration', testSecurityRulesConfiguration);
    
    // Print test summary
    log('='.repeat(60));
    log('TEST SUMMARY');
    log('='.repeat(60));
    log(`Total tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`);
    log(`Failed: ${testResults.failed}`);
    log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    
    if (testResults.errors.length > 0) {
        log('\nERRORS:');
        testResults.errors.forEach((error, index) => {
            log(`${index + 1}. ${error.message}`);
        });
    }
    
    return testResults.failed === 0;
}

// Export for module usage
module.exports = {
    runAllTests,
    testResults
};

// Run tests if called directly
if (require.main === module) {
    const success = runAllTests();
    process.exit(success ? 0 : 1);
}
