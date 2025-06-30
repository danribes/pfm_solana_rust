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
    success: results.success,
    testResults: results.testResults.map(testResult => ({
      testFilePath: testResult.testFilePath,
      numPassingTests: testResult.numPassingTests,
      numFailingTests: testResult.numFailingTests,
      numPendingTests: testResult.numPendingTests,
      status: testResult.numFailingTests > 0 ? 'failed' : 'passed',
      duration: testResult.perfStats.end - testResult.perfStats.start,
      failures: testResult.testResults
        .filter(test => test.status === 'failed')
        .map(test => ({
          title: test.title,
          fullName: test.fullName,
          status: test.status,
          duration: test.duration,
          failureMessages: test.failureMessages
        }))
    }))
  };

  // Write summary to JSON file for CI consumption
  const summaryPath = path.join(__dirname, '../../test-results-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Generate markdown report for GitHub Actions
  const markdownReport = generateMarkdownReport(summary);
  const reportPath = path.join(__dirname, '../../test-results-report.md');
  fs.writeFileSync(reportPath, markdownReport);

  // Console output for CI logs
  console.log('\n🧪 ====== BACKEND TEST SUMMARY ======');
  console.log(`📊 Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`❌ Failed: ${summary.failedTests}`);
  console.log(`⏸️  Pending: ${summary.pendingTests}`);
  console.log(`📁 Test Suites: ${summary.totalTestSuites} (${summary.passedTestSuites} passed, ${summary.failedTestSuites} failed)`);
  console.log(`⏱️  Duration: ${(results.runTime / 1000).toFixed(2)}s`);
  console.log(`🎯 Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
  
  if (summary.failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    summary.testResults.forEach(testResult => {
      if (testResult.failures.length > 0) {
        console.log(`\n📄 ${path.basename(testResult.testFilePath)}:`);
        testResult.failures.forEach(failure => {
          console.log(`  - ${failure.title}`);
        });
      }
    });
  }
  
  console.log('\n======================================\n');

  return results;
};

function generateMarkdownReport(summary) {
  const successRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(1);
  const status = summary.success ? '✅ PASSED' : '❌ FAILED';
  
  let report = `# Backend Test Results Report\n\n`;
  report += `**Status:** ${status}\n`;
  report += `**Generated:** ${summary.timestamp}\n\n`;
  
  report += `## 📊 Test Summary\n\n`;
  report += `| Metric | Count | Percentage |\n`;
  report += `|--------|-------|------------|\n`;
  report += `| Total Tests | ${summary.totalTests} | 100% |\n`;
  report += `| Passed Tests | ${summary.passedTests} | ${successRate}% |\n`;
  report += `| Failed Tests | ${summary.failedTests} | ${(100 - successRate).toFixed(1)}% |\n`;
  report += `| Pending Tests | ${summary.pendingTests} | - |\n`;
  report += `| Test Suites | ${summary.totalTestSuites} | - |\n\n`;
  
  if (summary.failedTests > 0) {
    report += `## ❌ Failed Tests\n\n`;
    summary.testResults.forEach(testResult => {
      if (testResult.failures.length > 0) {
        report += `### ${path.basename(testResult.testFilePath)}\n\n`;
        testResult.failures.forEach(failure => {
          report += `- **${failure.title}**\n`;
          if (failure.failureMessages && failure.failureMessages.length > 0) {
            report += `  \`\`\`\n  ${failure.failureMessages[0].slice(0, 200)}...\n  \`\`\`\n`;
          }
        });
        report += `\n`;
      }
    });
  }
  
  report += `## 🎯 Test Quality Metrics\n\n`;
  report += `- **Success Rate:** ${successRate}%\n`;
  report += `- **Test Suites:** ${summary.passedTestSuites}/${summary.totalTestSuites} passed\n`;
  report += `- **Coverage:** Report generated separately\n`;
  report += `- **CI Integration:** ✅ Automated\n\n`;
  
  return report;
} 