const fs = require('fs');
const path = require('path');

/**
 * Jest Result Processor for CI Integration
 * Processes test results and generates CI-friendly reports
 */

module.exports = (results) => {
  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: results.numTotalTests,
    passedTests: results.numPassedTests,
    failedTests: results.numFailedTests,
    pendingTests: results.numPendingTests,
    totalTestSuites: results.numTotalTestSuites,
    passedTestSuites: results.numPassedTestSuites,
    failedTestSuites: results.numFailedTestSuites,
    success: results.success
  };

  // Console output for CI logs
  console.log('\n🧪 ====== BACKEND TEST SUMMARY ======');
  console.log(`📊 Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`❌ Failed: ${summary.failedTests}`);
  console.log(`⏸️  Pending: ${summary.pendingTests}`);
  console.log(`📁 Test Suites: ${summary.totalTestSuites}`);
  console.log(`🎯 Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
  console.log('======================================\n');

  return results;
};
