#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * Cleans up test data after CI runs
 */

const { testDataManager } = require('./testDataManager');

async function cleanupTestData() {
  console.log('🧹 Starting test data cleanup...');
  
  try {
    await testDataManager.initialize();
    await testDataManager.cleanup();
    await testDataManager.close();
    
    console.log('✅ Test data cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupTestData();
}

module.exports = { cleanupTestData };
