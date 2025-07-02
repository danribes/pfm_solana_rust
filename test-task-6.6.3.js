#!/usr/bin/env node

/**
 * Test Suite for Task 6.6.3: SSL/TLS Certificate Management & Security
 * PFM Community Management Application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const TEST_CONFIG = {
    domains: [
        'pfm-community.app',
        'api.pfm-community.app',
        'admin.pfm-community.app',
        'member.pfm-community.app'
    ],
    timeout: 10000
};

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
};

// Utility functions
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
}

function logError(message, error = null) {
    log(message, 'ERROR');
    if (error) {
        log(error.toString(), 'ERROR');
    }
    testResults.errors.push({ message, error: error ? error.toString() : null });
}

function logSuccess(message) {
    log(message, 'PASS');
}

function logFail(message) {
    log(message, 'FAIL');
}

// Test helper functions
function runTest(testName, testFunction) {
    testResults.total++;
    log(`Running test: ${testName}`);
    
    try {
        const result = testFunction();
        if (result === true) {
            testResults.passed++;
            logSuccess(`✓ ${testName} passed`);
            return true;
        } else {
            testResults.failed++;
            logFail(`✗ ${testName} failed`);
            return false;
        }
    } catch (error) {
        testResults.failed++;
        logError(`✗ ${testName} failed with error`, error);
        return false;
    }
}

// File structure tests
function testSSLDirectoryStructure() {
    const requiredDirectories = [
        'infra/ssl/config',
        'infra/ssl/monitoring',
        'scripts/ssl'
    ];
    
    for (const dir of requiredDirectories) {
        if (!fs.existsSync(dir)) {
            logError(`Required directory missing: ${dir}`);
            return false;
        }
    }
    
    return true;
}

function testSSLConfigurationFiles() {
    const requiredFiles = [
        'infra/ssl/config/certbot-config.ini',
        'infra/ssl/config/renewal-config.yml',
        'infra/ssl/config/tls-config.conf',
        'infra/ssl/config/security-headers.conf'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            logError(`Required configuration file missing: ${file}`);
            return false;
        }
        
        // Check file is not empty
        const stats = fs.statSync(file);
        if (stats.size === 0) {
            logError(`Configuration file is empty: ${file}`);
            return false;
        }
    }
    
    return true;
}

function testSSLScripts() {
    const requiredScripts = [
        'scripts/ssl/deploy-certificates.sh',
        'scripts/ssl/certificate-monitor.sh',
        'scripts/ssl/validate-ssl.sh',
        'scripts/ssl/emergency-renewal.sh'
    ];
    
    for (const script of requiredScripts) {
        if (!fs.existsSync(script)) {
            logError(`Required script missing: ${script}`);
            return false;
        }
        
        // Check script is executable
        const stats = fs.statSync(script);
        if (!(stats.mode & parseInt('111', 8))) {
            logError(`Script is not executable: ${script}`);
            return false;
        }
    }
    
    return true;
}

function testDockerComposeSSLConfig() {
    const dockerComposeFile = 'infra/ssl/docker-compose.ssl.yml';
    
    if (!fs.existsSync(dockerComposeFile)) {
        logError(`Docker Compose SSL file missing: ${dockerComposeFile}`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(dockerComposeFile, 'utf8');
        
        // Check for required services
        const requiredServices = ['nginx-ssl', 'certbot'];
        for (const service of requiredServices) {
            if (!content.includes(service)) {
                logError(`Required service missing in Docker Compose: ${service}`);
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logError(`Error reading Docker Compose file: ${dockerComposeFile}`, error);
        return false;
    }
}

// Main test runner
function runAllTests() {
    log('Starting SSL/TLS Certificate Management tests...');
    log('='.repeat(60));
    
    // File structure tests
    runTest('SSL Directory Structure', testSSLDirectoryStructure);
    runTest('SSL Configuration Files', testSSLConfigurationFiles);
    runTest('SSL Scripts', testSSLScripts);
    runTest('Docker Compose SSL Config', testDockerComposeSSLConfig);
    
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
    
    // Exit with appropriate code
    process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests if called directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testResults
};
