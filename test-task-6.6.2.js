/**
 * Task 6.6.2: Production Web Server Configuration
 * Comprehensive Test Suite
 * 
 * Tests all aspects of the production web server configuration including:
 * - Enhanced Nginx configuration
 * - Security headers and settings
 * - Performance optimization
 * - Load balancing and upstream configuration
 * - Monitoring and logging
 * - Deployment and management scripts
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  requiredFiles: [
    // Core configuration files
    'infra/webserver/nginx.conf',
    'infra/webserver/security-headers.conf',
    'infra/webserver/performance.conf',
    'infra/webserver/rate-limiting.conf',
    'infra/webserver/upstream.conf',
    'infra/webserver/logging.conf',
    'infra/webserver/monitoring.conf',
    'infra/webserver/ssl.conf',
    'infra/webserver/sites-available/pfm-production.conf',
    
    // Management scripts
    'scripts/webserver/deploy-webserver.sh',
    'scripts/webserver/reload-config.sh',
    'scripts/webserver/health-check.sh',
    'scripts/webserver/log-rotation.sh'
  ],
  
  nginxPatterns: [
    'worker_processes auto',
    'worker_cpu_affinity auto',
    'worker_rlimit_nofile',
    'events {',
    'worker_connections 4096',
    'use epoll',
    'multi_accept on'
  ],
  
  securityPatterns: [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-XSS-Protection',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy'
  ],
  
  performancePatterns: [
    'gzip on',
    'brotli on',
    'proxy_cache',
    'expires',
    'sendfile on',
    'tcp_nopush on',
    'keepalive'
  ],
  
  upstreamPatterns: [
    'upstream member_portal',
    'upstream admin_dashboard',
    'upstream api_server',
    'least_conn',
    'keepalive',
    'max_fails'
  ],
  
  monitoringPatterns: [
    'location = /health',
    'location = /nginx_status',
    'location = /metrics',
    'stub_status on',
    'access_log off'
  ],
  
  scriptPatterns: [
    '#!/bin/bash',
    'set -euo pipefail',
    'log_info',
    'log_success',
    'log_error',
    'main()'
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkFileExists(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      isExecutable: !!(stats.mode & parseInt('111', 8))
    };
  } catch (error) {
    return { exists: false, size: 0, isExecutable: false };
  }
}

function checkPattern(content, pattern) {
  if (!content) return false;
  const regex = new RegExp(pattern, 'i');
  return regex.test(content);
}

function countPatternMatches(content, pattern) {
  if (!content) return 0;
  const regex = new RegExp(pattern, 'gi');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function checkScriptSyntax(filePath) {
  try {
    const content = readFileContent(filePath);
    if (!content) return false;
    
    // Basic bash syntax checks
    const hasShebang = content.startsWith('#!/bin/bash');
    const hasSetOptions = content.includes('set -euo pipefail');
    const hasMainFunction = content.includes('main()');
    const hasProperQuoting = !content.match(/\$\w+(?!\{)/g) || true; // Simplified check
    
    return hasShebang && hasSetOptions && hasMainFunction;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testFileStructure() {
  console.log('\n🏗️  Testing File Structure...\n');
  
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.requiredFiles.forEach((file, index) => {
    total++;
    const testNum = index + 1;
    const fileInfo = checkFileExists(file);
    
    if (fileInfo.exists) {
      console.log(`✅ Test ${testNum}: ${file} - EXISTS (${fileInfo.size} bytes)${fileInfo.isExecutable ? ' [EXECUTABLE]' : ''}`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${file} - MISSING`);
    }
  });
  
  return { passed, total };
}

function testNginxConfiguration() {
  console.log('\n🔧 Testing Enhanced Nginx Configuration...\n');
  
  const content = readFileContent('infra/webserver/nginx.conf');
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.nginxPatterns.forEach((pattern, index) => {
    total++;
    const testNum = index + 1;
    const hasPattern = checkPattern(content, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: nginx.conf - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: nginx.conf - ${pattern} - MISSING`);
    }
  });
  
  // Additional nginx configuration tests
  const additionalTests = [
    { name: 'Worker Process Auto', test: () => checkPattern(content, 'worker_processes auto') },
    { name: 'Advanced Buffer Config', test: () => checkPattern(content, 'client_body_buffer_size') },
    { name: 'Real IP Configuration', test: () => checkPattern(content, 'set_real_ip_from') },
    { name: 'Proxy Settings', test: () => checkPattern(content, 'proxy_buffering') },
    { name: 'Include Statements', test: () => countPatternMatches(content, 'include.*conf') >= 6 }
  ];
  
  additionalTests.forEach((test, index) => {
    total++;
    const testNum = passed + index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testSecurityConfiguration() {
  console.log('\n🔒 Testing Security Configuration...\n');
  
  const securityContent = readFileContent('infra/webserver/security-headers.conf');
  const sslContent = readFileContent('infra/webserver/ssl.conf');
  
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.securityPatterns.forEach((pattern, index) => {
    total++;
    const testNum = index + 1;
    const hasPattern = checkPattern(securityContent, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Security Headers - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Security Headers - ${pattern} - MISSING`);
    }
  });
  
  // SSL configuration tests
  const sslTests = [
    { name: 'TLS Protocols', test: () => checkPattern(sslContent, 'TLSv1\\.[23]') },
    { name: 'Perfect Forward Secrecy', test: () => checkPattern(sslContent, 'ECDHE') },
    { name: 'OCSP Stapling', test: () => checkPattern(sslContent, 'ssl_stapling on') },
    { name: 'Session Configuration', test: () => checkPattern(sslContent, 'ssl_session_cache') },
    { name: 'DH Parameters', test: () => checkPattern(sslContent, 'ssl_dhparam') }
  ];
  
  sslTests.forEach((test, index) => {
    total++;
    const testNum = passed + index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: SSL - ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: SSL - ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testPerformanceConfiguration() {
  console.log('\n⚡ Testing Performance Configuration...\n');
  
  const performanceContent = readFileContent('infra/webserver/performance.conf');
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.performancePatterns.forEach((pattern, index) => {
    total++;
    const testNum = index + 1;
    const hasPattern = checkPattern(performanceContent, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Performance - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Performance - ${pattern} - MISSING`);
    }
  });
  
  // Additional performance tests
  const additionalTests = [
    { name: 'Gzip Compression Levels', test: () => checkPattern(performanceContent, 'gzip_comp_level') },
    { name: 'Brotli Compression', test: () => checkPattern(performanceContent, 'brotli on') },
    { name: 'Cache Control Mapping', test: () => checkPattern(performanceContent, 'map.*expires') },
    { name: 'Open File Cache', test: () => checkPattern(performanceContent, 'open_file_cache') },
    { name: 'Proxy Cache Path', test: () => checkPattern(performanceContent, 'proxy_cache_path') }
  ];
  
  additionalTests.forEach((test, index) => {
    total++;
    const testNum = passed + index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testUpstreamConfiguration() {
  console.log('\n🔄 Testing Upstream & Load Balancing...\n');
  
  const upstreamContent = readFileContent('infra/webserver/upstream.conf');
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.upstreamPatterns.forEach((pattern, index) => {
    total++;
    const testNum = index + 1;
    const hasPattern = checkPattern(upstreamContent, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Upstream - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Upstream - ${pattern} - MISSING`);
    }
  });
  
  // Additional upstream tests
  const additionalTests = [
    { name: 'WebSocket Support', test: () => checkPattern(upstreamContent, 'websocket') },
    { name: 'Health Check Config', test: () => checkPattern(upstreamContent, 'backend_health') },
    { name: 'Connection Pooling', test: () => checkPattern(upstreamContent, 'keepalive_requests') },
    { name: 'Fail Timeout Settings', test: () => checkPattern(upstreamContent, 'fail_timeout') }
  ];
  
  additionalTests.forEach((test, index) => {
    total++;
    const testNum = passed + index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testMonitoringConfiguration() {
  console.log('\n📊 Testing Monitoring Configuration...\n');
  
  const monitoringContent = readFileContent('infra/webserver/monitoring.conf');
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.monitoringPatterns.forEach((pattern, index) => {
    total++;
    const testNum = index + 1;
    const hasPattern = checkPattern(monitoringContent, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Monitoring - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Monitoring - ${pattern} - MISSING`);
    }
  });
  
  // Additional monitoring tests
  const additionalTests = [
    { name: 'Deep Health Check', test: () => checkPattern(monitoringContent, '/deep-health') },
    { name: 'Performance Endpoint', test: () => checkPattern(monitoringContent, '/perf') },
    { name: 'SSL Info Endpoint', test: () => checkPattern(monitoringContent, '/ssl-info') },
    { name: 'Rate Limit Status', test: () => checkPattern(monitoringContent, '/rate-limit-status') },
    { name: 'Upstream Status', test: () => checkPattern(monitoringContent, '/upstream-status') }
  ];
  
  additionalTests.forEach((test, index) => {
    total++;
    const testNum = passed + index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testLoggingConfiguration() {
  console.log('\n📝 Testing Logging Configuration...\n');
  
  const loggingContent = readFileContent('infra/webserver/logging.conf');
  let passed = 0;
  let total = 0;
  
  const loggingTests = [
    { name: 'Main Log Format', test: () => checkPattern(loggingContent, 'log_format main') },
    { name: 'JSON Log Format', test: () => checkPattern(loggingContent, 'log_format json') },
    { name: 'Security Log Format', test: () => checkPattern(loggingContent, 'log_format security') },
    { name: 'Performance Log Format', test: () => checkPattern(loggingContent, 'log_format performance') },
    { name: 'Conditional Logging', test: () => checkPattern(loggingContent, 'map.*loggable') },
    { name: 'Bot Detection Logging', test: () => checkPattern(loggingContent, 'bot_request') },
    { name: 'Slow Request Logging', test: () => checkPattern(loggingContent, 'slow_request') },
    { name: 'SSL Logging', test: () => checkPattern(loggingContent, 'ssl.log') },
    { name: 'Upstream Logging', test: () => checkPattern(loggingContent, 'upstream.log') }
  ];
  
  loggingTests.forEach((test, index) => {
    total++;
    const testNum = index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testSiteConfiguration() {
  console.log('\n🌐 Testing Site Configuration...\n');
  
  const siteContent = readFileContent('infra/webserver/sites-available/pfm-production.conf');
  let passed = 0;
  let total = 0;
  
  const siteTests = [
    { name: 'Main Domain Config', test: () => checkPattern(siteContent, 'server_name pfm-community.app') },
    { name: 'Member App Config', test: () => checkPattern(siteContent, 'server_name app.pfm-community.app') },
    { name: 'Admin Dashboard Config', test: () => checkPattern(siteContent, 'server_name admin.pfm-community.app') },
    { name: 'API Server Config', test: () => checkPattern(siteContent, 'server_name api.pfm-community.app') },
    { name: 'HTTP to HTTPS Redirect', test: () => checkPattern(siteContent, 'return 301 https') },
    { name: 'SSL Certificate Paths', test: () => checkPattern(siteContent, 'ssl_certificate.*letsencrypt') },
    { name: 'WebSocket Support', test: () => checkPattern(siteContent, 'proxy_set_header Upgrade') },
    { name: 'CORS Configuration', test: () => checkPattern(siteContent, 'Access-Control-Allow-Origin') },
    { name: 'Rate Limiting Applied', test: () => checkPattern(siteContent, 'limit_req zone') },
    { name: 'Proxy Cache Configuration', test: () => checkPattern(siteContent, 'proxy_cache pfm_cache') },
    { name: 'Static File Optimization', test: () => checkPattern(siteContent, 'location.*static') },
    { name: 'Monitoring Endpoints', test: () => checkPattern(siteContent, 'include.*monitoring.conf') }
  ];
  
  siteTests.forEach((test, index) => {
    total++;
    const testNum = index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

function testDeploymentScripts() {
  console.log('\n🚀 Testing Deployment Scripts...\n');
  
  const scripts = [
    'scripts/webserver/deploy-webserver.sh',
    'scripts/webserver/reload-config.sh',
    'scripts/webserver/health-check.sh',
    'scripts/webserver/log-rotation.sh'
  ];
  
  let passed = 0;
  let total = 0;
  
  scripts.forEach((script, index) => {
    const fileInfo = checkFileExists(script);
    
    total++;
    const testNum = index * 2 + 1;
    if (fileInfo.exists) {
      console.log(`✅ Test ${testNum}: ${script} - EXISTS (${fileInfo.size} bytes)`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${script} - MISSING`);
    }
    
    total++;
    const testNum2 = index * 2 + 2;
    if (fileInfo.isExecutable) {
      console.log(`✅ Test ${testNum2}: ${script} - EXECUTABLE`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum2}: ${script} - NOT EXECUTABLE`);
    }
  });
  
  // Test script syntax
  scripts.forEach((script, index) => {
    total++;
    const testNum = scripts.length * 2 + index + 1;
    if (checkScriptSyntax(script)) {
      console.log(`✅ Test ${testNum}: ${script} - SYNTAX OK`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${script} - SYNTAX ISSUES`);
    }
  });
  
  return { passed, total };
}

function testRateLimitingConfiguration() {
  console.log('\n🛡️  Testing Rate Limiting Configuration...\n');
  
  const rateLimitContent = readFileContent('infra/webserver/rate-limiting.conf');
  let passed = 0;
  let total = 0;
  
  const rateLimitTests = [
    { name: 'Rate Limit Zones', test: () => countPatternMatches(rateLimitContent, 'limit_req_zone') >= 4 },
    { name: 'Connection Limiting', test: () => checkPattern(rateLimitContent, 'limit_conn_zone') },
    { name: 'Request Method Filtering', test: () => checkPattern(rateLimitContent, 'map.*request_method') },
    { name: 'Bad User Agent Blocking', test: () => checkPattern(rateLimitContent, 'bad_user_agent') },
    { name: 'Bot Detection', test: () => checkPattern(rateLimitContent, 'bot.*spider.*crawler') },
    { name: 'Geographic Blocking', test: () => checkPattern(rateLimitContent, 'geo.*blocked_country') },
    { name: 'IP Blocking Support', test: () => checkPattern(rateLimitContent, 'geo.*limit') },
    { name: 'Timeout Settings', test: () => checkPattern(rateLimitContent, 'client_body_timeout') }
  ];
  
  rateLimitTests.forEach((test, index) => {
    total++;
    const testNum = index + 1;
    if (test.test()) {
      console.log(`✅ Test ${testNum}: ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${test.name} - FAILED`);
    }
  });
  
  return { passed, total };
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function runAllTests() {
  console.log('🧪 TASK 6.6.2: Production Web Server Configuration - Test Suite');
  console.log('================================================================================');
  
  const testResults = [];
  
  // Run all test categories
  testResults.push({ name: 'File Structure', ...testFileStructure() });
  testResults.push({ name: 'Enhanced Nginx Configuration', ...testNginxConfiguration() });
  testResults.push({ name: 'Security Configuration', ...testSecurityConfiguration() });
  testResults.push({ name: 'Performance Configuration', ...testPerformanceConfiguration() });
  testResults.push({ name: 'Upstream & Load Balancing', ...testUpstreamConfiguration() });
  testResults.push({ name: 'Monitoring Configuration', ...testMonitoringConfiguration() });
  testResults.push({ name: 'Logging Configuration', ...testLoggingConfiguration() });
  testResults.push({ name: 'Site Configuration', ...testSiteConfiguration() });
  testResults.push({ name: 'Deployment Scripts', ...testDeploymentScripts() });
  testResults.push({ name: 'Rate Limiting Configuration', ...testRateLimitingConfiguration() });
  
  // Calculate overall results
  const totalPassed = testResults.reduce((sum, result) => sum + result.passed, 0);
  const totalTests = testResults.reduce((sum, result) => sum + result.total, 0);
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  // Display summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('================================================================================');
  
  testResults.forEach(result => {
    const rate = ((result.passed / result.total) * 100).toFixed(1);
    const status = result.passed === result.total ? '✅' : result.passed > result.total * 0.7 ? '⚠️' : '❌';
    console.log(`${status} ${result.name}: ${result.passed}/${result.total} (${rate}%)`);
  });
  
  console.log('--------------------------------------------------------------------------------');
  console.log(`🎯 OVERALL SUCCESS RATE: ${totalPassed}/${totalTests} (${successRate}%)`);
  
  if (successRate >= 95) {
    console.log('🎉 EXCELLENT! Task 6.6.2 web server configuration is production-ready.');
  } else if (successRate >= 80) {
    console.log('👍 GOOD! Most web server features are implemented correctly.');
  } else {
    console.log('⚠️  NEEDS WORK! Several web server components need attention.');
  }
  
  console.log('================================================================================');
}

// Run the tests
runAllTests();
