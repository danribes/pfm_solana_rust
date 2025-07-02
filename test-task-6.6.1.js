/**
 * Task 6.6.1: Public Website Hosting & Domain Setup
 * Comprehensive Test Suite
 * 
 * Tests all aspects of the hosting infrastructure including:
 * - Infrastructure configuration files
 * - DNS and domain setup
 * - Production deployment scripts
 * - Monitoring and backup configurations
 * - SSL and security setup
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  requiredFiles: [
    // Infrastructure Configuration
    'infra/hosting/docker-compose.production.yml',
    'infra/hosting/nginx.conf',
    'infra/hosting/ssl-config.conf',
    'infra/hosting/backup-config.yml',
    
    // DNS & Domain Configuration
    'infra/dns/dns-records.tf',
    'infra/dns/domain-config.yml',
    
    // Monitoring Configuration
    'infra/monitoring/uptime-monitor.yml',
    'infra/monitoring/performance-alerts.yml',
    
    // Deployment Scripts
    'scripts/hosting/deploy-production.sh',
    'scripts/hosting/ssl-renewal.sh',
    'scripts/hosting/health-check.sh'
  ],
  
  dockerComposePatterns: [
    'version:',
    'services:',
    'nginx-proxy:',
    'member-portal:',
    'admin-dashboard:',
    'api-server:',
    'postgres:',
    'redis:',
    'networks:',
    'volumes:'
  ],
  
  nginxPatterns: [
    'events {',
    'http {',
    'server {',
    'listen 443 ssl',
    'ssl_certificate',
    'proxy_pass',
    'pfm-community.app'
  ],
  
  dnsPatterns: [
    'cloudflare_record',
    'zone_id',
    'pfm-community.app',
    'app.pfm-community.app',
    'admin.pfm-community.app',
    'api.pfm-community.app'
  ],
  
  scriptPatterns: [
    '#!/bin/bash',
    'set -euo pipefail',
    'log_info',
    'docker',
    'certbot',
    'curl'
  ],
  
  monitoringPatterns: [
    'monitors:',
    'url:',
    'timeout:',
    'interval:',
    'alerts:',
    'email:',
    'slack:'
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return '';
  }
}

function checkPattern(content, pattern) {
  const regex = new RegExp(pattern, 'gi');
  return regex.test(content);
}

function countPatternMatches(content, pattern) {
  const regex = new RegExp(pattern, 'gi');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function isExecutable(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return !!(stats.mode & parseInt('0100', 8));
  } catch (error) {
    return false;
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testFileStructure() {
  console.log('\n🏗️  Testing File Structure...\n');
  
  const results = [];
  let passed = 0;
  let total = 0;
  
  TEST_CONFIG.requiredFiles.forEach((file, index) => {
    total++;
    const testNum = index + 1;
    const exists = fileExists(file);
    const size = getFileSize(file);
    
    if (exists && size > 50) { // Minimum file size check
      console.log(`✅ Test ${testNum}: ${file} - EXISTS (${size} bytes)`);
      results.push({ test: testNum, file, status: 'passed', size });
      passed++;
    } else if (exists) {
      console.log(`⚠️  Test ${testNum}: ${file} - EXISTS but too small (${size} bytes)`);
      results.push({ test: testNum, file, status: 'warning', size });
    } else {
      console.log(`❌ Test ${testNum}: ${file} - MISSING`);
      results.push({ test: testNum, file, status: 'failed', size: 0 });
    }
  });
  
  return { passed, total, results };
}

function testDockerCompose() {
  console.log('\n🐳 Testing Docker Compose Configuration...\n');
  
  const dockerComposePath = 'infra/hosting/docker-compose.production.yml';
  const content = readFileContent(dockerComposePath);
  
  let passed = 0;
  let total = TEST_CONFIG.dockerComposePatterns.length;
  
  TEST_CONFIG.dockerComposePatterns.forEach((pattern, index) => {
    const testNum = index + 1;
    const hasPattern = checkPattern(content, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Docker Compose - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Docker Compose - ${pattern} - MISSING`);
    }
  });
  
  // Additional Docker Compose specific tests
  const additionalTests = [
    { name: 'Service Count', test: () => countPatternMatches(content, 'image:') >= 4 },
    { name: 'Network Configuration', test: () => checkPattern(content, 'networks:.*pfm-') },
    { name: 'Volume Configuration', test: () => countPatternMatches(content, 'volumes:') >= 1 },
    { name: 'Environment Variables', test: () => checkPattern(content, '\\$\\{.*\\}') },
    { name: 'Restart Policy', test: () => checkPattern(content, 'restart:.*unless-stopped') }
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

function testNginxConfiguration() {
  console.log('\n🌐 Testing Nginx Configuration...\n');
  
  const nginxPath = 'infra/hosting/nginx.conf';
  const content = readFileContent(nginxPath);
  
  let passed = 0;
  let total = TEST_CONFIG.nginxPatterns.length;
  
  TEST_CONFIG.nginxPatterns.forEach((pattern, index) => {
    const testNum = index + 1;
    const hasPattern = checkPattern(content, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Nginx Config - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Nginx Config - ${pattern} - MISSING`);
    }
  });
  
  // Additional Nginx specific tests
  const additionalTests = [
    { name: 'SSL Configuration', test: () => checkPattern(content, 'ssl_certificate') },
    { name: 'Security Headers', test: () => checkPattern(content, 'add_header.*X-Frame-Options') },
    { name: 'Gzip Compression', test: () => checkPattern(content, 'gzip on') },
    { name: 'Rate Limiting', test: () => checkPattern(content, 'limit_req') },
    { name: 'Subdomain Routing', test: () => countPatternMatches(content, 'server_name.*\\.pfm-community\\.app') >= 3 }
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

function testDNSConfiguration() {
  console.log('\n🌍 Testing DNS Configuration...\n');
  
  const dnsPath = 'infra/dns/dns-records.tf';
  const domainPath = 'infra/dns/domain-config.yml';
  
  const dnsContent = readFileContent(dnsPath);
  const domainContent = readFileContent(domainPath);
  
  let passed = 0;
  let total = TEST_CONFIG.dnsPatterns.length;
  
  TEST_CONFIG.dnsPatterns.forEach((pattern, index) => {
    const testNum = index + 1;
    const hasPattern = checkPattern(dnsContent, pattern) || checkPattern(domainContent, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: DNS Config - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: DNS Config - ${pattern} - MISSING`);
    }
  });
  
  // Additional DNS specific tests
  const additionalTests = [
    { name: 'Terraform Provider', test: () => checkPattern(dnsContent, 'provider.*cloudflare') },
    { name: 'DNS Records Count', test: () => countPatternMatches(dnsContent, 'cloudflare_record') >= 5 },
    { name: 'MX Records', test: () => checkPattern(dnsContent, 'type.*=.*"MX"') },
    { name: 'Security Records', test: () => checkPattern(dnsContent, 'CAA|SPF|DMARC') },
    { name: 'Domain Security', test: () => checkPattern(domainContent, 'dnssec.*true') }
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

function testDeploymentScripts() {
  console.log('\n🚀 Testing Deployment Scripts...\n');
  
  const scripts = [
    'scripts/hosting/deploy-production.sh',
    'scripts/hosting/ssl-renewal.sh',
    'scripts/hosting/health-check.sh'
  ];
  
  let passed = 0;
  let total = 0;
  
  scripts.forEach(scriptPath => {
    const content = readFileContent(scriptPath);
    const scriptName = path.basename(scriptPath);
    
    TEST_CONFIG.scriptPatterns.forEach((pattern, index) => {
      total++;
      const testNum = total;
      const hasPattern = checkPattern(content, pattern);
      
      if (hasPattern) {
        console.log(`✅ Test ${testNum}: ${scriptName} - ${pattern} - FOUND`);
        passed++;
      } else {
        console.log(`❌ Test ${testNum}: ${scriptName} - ${pattern} - MISSING`);
      }
    });
    
    // Check if script is executable
    total++;
    const testNum = total;
    if (isExecutable(scriptPath)) {
      console.log(`✅ Test ${testNum}: ${scriptName} - EXECUTABLE`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: ${scriptName} - NOT EXECUTABLE`);
    }
  });
  
  return { passed, total };
}

function testMonitoringConfiguration() {
  console.log('\n📊 Testing Monitoring Configuration...\n');
  
  const monitoringFiles = [
    'infra/monitoring/uptime-monitor.yml',
    'infra/monitoring/performance-alerts.yml'
  ];
  
  let passed = 0;
  let total = 0;
  
  monitoringFiles.forEach(filePath => {
    const content = readFileContent(filePath);
    const fileName = path.basename(filePath);
    
    TEST_CONFIG.monitoringPatterns.forEach((pattern, index) => {
      total++;
      const testNum = total;
      const hasPattern = checkPattern(content, pattern);
      
      if (hasPattern) {
        console.log(`✅ Test ${testNum}: ${fileName} - ${pattern} - FOUND`);
        passed++;
      } else {
        console.log(`❌ Test ${testNum}: ${fileName} - ${pattern} - MISSING`);
      }
    });
  });
  
  // Additional monitoring tests
  const additionalTests = [
    { 
      name: 'Uptime Monitor Endpoints', 
      test: () => {
        const content = readFileContent('infra/monitoring/uptime-monitor.yml');
        return countPatternMatches(content, 'https://.*pfm-community\\.app') >= 3;
      }
    },
    { 
      name: 'Alert Configuration', 
      test: () => {
        const content = readFileContent('infra/monitoring/performance-alerts.yml');
        return checkPattern(content, 'warning_threshold') && checkPattern(content, 'critical_threshold');
      }
    },
    { 
      name: 'Notification Channels', 
      test: () => {
        const content = readFileContent('infra/monitoring/uptime-monitor.yml');
        return checkPattern(content, 'email:') && checkPattern(content, 'slack:');
      }
    }
  ];
  
  additionalTests.forEach((test, index) => {
    total++;
    const testNum = total;
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
  
  const securityTests = [
    {
      name: 'SSL Configuration',
      file: 'infra/hosting/ssl-config.conf',
      patterns: ['ssl_protocols', 'ssl_ciphers', 'ssl_session_cache', 'HSTS']
    },
    {
      name: 'Nginx Security Headers',
      file: 'infra/hosting/nginx.conf',
      patterns: ['X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection', 'server_tokens off']
    },
    {
      name: 'Domain Security',
      file: 'infra/dns/domain-config.yml',
      patterns: ['dnssec: true', 'domain_lock: true', 'registrar_lock: true']
    }
  ];
  
  let passed = 0;
  let total = 0;
  
  securityTests.forEach(test => {
    const content = readFileContent(test.file);
    
    test.patterns.forEach((pattern, index) => {
      total++;
      const testNum = total;
      const hasPattern = checkPattern(content, pattern);
      
      if (hasPattern) {
        console.log(`✅ Test ${testNum}: ${test.name} - ${pattern} - FOUND`);
        passed++;
      } else {
        console.log(`❌ Test ${testNum}: ${test.name} - ${pattern} - MISSING`);
      }
    });
  });
  
  return { passed, total };
}

function testBackupConfiguration() {
  console.log('\n💾 Testing Backup Configuration...\n');
  
  const backupPath = 'infra/hosting/backup-config.yml';
  const content = readFileContent(backupPath);
  
  const backupPatterns = [
    'backup_strategy:',
    'database:',
    'postgres:',
    'redis:',
    'filesystem:',
    'retention:',
    'storage:',
    'encryption:',
    'recovery:',
    'monitoring:'
  ];
  
  let passed = 0;
  let total = backupPatterns.length;
  
  backupPatterns.forEach((pattern, index) => {
    const testNum = index + 1;
    const hasPattern = checkPattern(content, pattern);
    
    if (hasPattern) {
      console.log(`✅ Test ${testNum}: Backup Config - ${pattern} - FOUND`);
      passed++;
    } else {
      console.log(`❌ Test ${testNum}: Backup Config - ${pattern} - MISSING`);
    }
  });
  
  // Additional backup tests
  const additionalTests = [
    { name: 'Daily Backup Schedule', test: () => checkPattern(content, 'schedule:.*daily') },
    { name: 'S3 Storage Configuration', test: () => checkPattern(content, 's3:.*bucket') },
    { name: 'Encryption Settings', test: () => checkPattern(content, 'encryption:.*enabled: true') },
    { name: 'Recovery Procedures', test: () => checkPattern(content, 'recovery:.*database') }
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

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function runAllTests() {
  console.log('🧪 TASK 6.6.1: Public Website Hosting & Domain Setup - Test Suite');
  console.log('================================================================================');
  
  const testResults = [];
  
  // Run all test categories
  testResults.push({ name: 'File Structure', ...testFileStructure() });
  testResults.push({ name: 'Docker Compose Configuration', ...testDockerCompose() });
  testResults.push({ name: 'Nginx Configuration', ...testNginxConfiguration() });
  testResults.push({ name: 'DNS Configuration', ...testDNSConfiguration() });
  testResults.push({ name: 'Deployment Scripts', ...testDeploymentScripts() });
  testResults.push({ name: 'Monitoring Configuration', ...testMonitoringConfiguration() });
  testResults.push({ name: 'Security Configuration', ...testSecurityConfiguration() });
  testResults.push({ name: 'Backup Configuration', ...testBackupConfiguration() });
  
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
  
  if (successRate >= 90) {
    console.log('🎉 EXCELLENT! Task 6.6.1 hosting infrastructure is production-ready.');
  } else if (successRate >= 75) {
    console.log('👍 GOOD! Task 6.6.1 hosting infrastructure is solid with minor areas for improvement.');
  } else if (successRate >= 50) {
    console.log('⚠️  PARTIAL! Task 6.6.1 hosting infrastructure needs significant improvements.');
  } else {
    console.log('❌ INCOMPLETE! Task 6.6.1 hosting infrastructure requires major work.');
  }
  
  console.log('================================================================================');
  
  return {
    totalTests,
    totalPassed,
    successRate: parseFloat(successRate),
    testResults
  };
}

// ============================================================================
// EXPORT AND RUN
// ============================================================================

if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testFileStructure,
  testDockerCompose,
  testNginxConfiguration,
  testDNSConfiguration,
  testDeploymentScripts,
  testMonitoringConfiguration,
  testSecurityConfiguration,
  testBackupConfiguration,
  TEST_CONFIG
}; 