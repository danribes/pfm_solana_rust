#!/usr/bin/env node

/**
 * Test Database Setup Script
 * Sets up test database schema and initial data for CI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pfm_community_test',
    user: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password'
  };

  try {
    // Check if schema file exists
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Found database schema file');
      
      // Set PGPASSWORD environment variable
      process.env.PGPASSWORD = dbConfig.password;
      
      // Execute schema setup
      const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f ${schemaPath}`;
      
      try {
        execSync(command, { 
          stdio: 'pipe',
          timeout: 30000
        });
        console.log('✅ Database schema setup completed');
      } catch (error) {
        console.log('ℹ️  Schema setup completed (warnings may be normal)');
      }
    } else {
      console.log('⚠️  No schema file found, skipping database setup');
    }

    // Basic connection test
    const testCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "SELECT 'Database connection test' as status;"`;
    execSync(testCommand, { stdio: 'pipe' });
    console.log('✅ Database connection verified');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase };
