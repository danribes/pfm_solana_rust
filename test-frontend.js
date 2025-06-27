#!/usr/bin/env node

/**
 * PFM Frontend Test Script
 * 
 * This script helps you test the wallet infrastructure and frontend components
 * with the containerized backend services.
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logStep(message) {
  log(`\n➤ ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function checkPrerequisites() {
  logStep('Checking prerequisites...');
  
  // Check if Docker is installed and running
  try {
    exec('docker --version', (error) => {
      if (error) {
        logError('Docker is not installed or not accessible');
        process.exit(1);
      } else {
        logSuccess('Docker is available');
      }
    });
  } catch (error) {
    logError('Docker check failed');
    process.exit(1);
  }

  // Check if Node.js is installed
  logSuccess(`Node.js version: ${process.version}`);

  // Check if npm is available
  try {
    exec('npm --version', (error, stdout) => {
      if (error) {
        logError('npm is not available');
        process.exit(1);
      } else {
        logSuccess(`npm version: ${stdout.trim()}`);
      }
    });
  } catch (error) {
    logError('npm check failed');
    process.exit(1);
  }
}

function checkWalletInfrastructure() {
  logStep('Checking wallet infrastructure...');
  
  const requiredFiles = [
    'frontend/shared/types/wallet.ts',
    'frontend/shared/config/wallet.ts',
    'frontend/shared/utils/wallet.ts',
    'frontend/shared/contexts/WalletContext.tsx',
    'frontend/shared/hooks/useWallet.ts',
    'frontend/shared/components/WalletConnection/index.ts',
    'frontend/admin/pages/index.tsx',
    'frontend/member/pages/index.tsx',
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
    }
  }
}

function installDependencies() {
  logStep('Installing dependencies...');
  
  const directories = [
    'frontend/shared',
    'frontend/admin', 
    'frontend/member'
  ];

  for (const dir of directories) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      log(`Installing dependencies for ${dir}...`, 'yellow');
      
      const install = spawn('npm', ['install'], {
        cwd: dir,
        stdio: 'inherit'
      });

      install.on('close', (code) => {
        if (code === 0) {
          logSuccess(`Dependencies installed for ${dir}`);
        } else {
          logError(`Failed to install dependencies for ${dir}`);
        }
      });
    }
  }
}

function startContainerServices() {
  logStep('Starting container services...');
  
  log('Starting PostgreSQL, Redis, and Backend API...', 'yellow');
  
  const dockerCompose = spawn('docker-compose', ['up', '-d', 'postgres', 'redis', 'backend'], {
    stdio: 'inherit'
  });

  dockerCompose.on('close', (code) => {
    if (code === 0) {
      logSuccess('Container services started successfully');
      log('Services running:', 'green');
      log('  - PostgreSQL: localhost:5432', 'green');
      log('  - Redis: localhost:6379', 'green');
      log('  - Backend API: localhost:3001', 'green');
    } else {
      logError('Failed to start container services');
    }
  });
}

function showTestInstructions() {
  logHeader('Frontend Testing Instructions');
  
  log('The wallet infrastructure is ready for testing! Here are your options:\n', 'bright');
  
  log('1. QUICK TEST - Run individual portals:', 'cyan');
  log('   Admin Portal:  cd frontend/admin && npm run dev', 'yellow');
  log('   Member Portal: cd frontend/member && npm run dev', 'yellow');
  log('   Then visit: http://localhost:3000 (admin) or http://localhost:3001 (member)\n');
  
  log('2. FULL CONTAINER TEST - Run everything in containers:', 'cyan');
  log('   docker-compose up -d', 'yellow');
  log('   Then visit: http://localhost:3000 (admin) or http://localhost:3001 (member)\n');
  
  log('3. DEVELOPMENT MODE - With hot reload:', 'cyan');
  log('   Terminal 1: docker-compose up -d postgres redis backend', 'yellow');
  log('   Terminal 2: cd frontend/admin && npm run dev', 'yellow');
  log('   Terminal 3: cd frontend/member && npm run dev', 'yellow');
  
  logHeader('What You Can Test');
  
  log('✓ Wallet Connection (Phantom, Solflare, Backpack, Glow, Slope)', 'green');
  log('✓ Multi-wallet support and switching', 'green');
  log('✓ Network detection (Devnet/Mainnet)', 'green');
  log('✓ Container service integration', 'green');
  log('✓ Health monitoring endpoints', 'green');
  log('✓ Session management with Redis', 'green');
  log('✓ PostgreSQL user data persistence', 'green');
  
  logHeader('Prerequisites for Testing');
  
  log('Make sure you have:', 'yellow');
  log('• A Solana wallet installed (Phantom, Solflare, etc.)', 'yellow');
  log('• Some test SOL for devnet transactions', 'yellow');
  log('• Modern browser with Web3 support', 'yellow');
  
  logHeader('Troubleshooting');
  
  log('If you encounter issues:', 'yellow');
  log('• Check browser console for wallet connection errors', 'yellow');
  log('• Verify container services are running: docker-compose ps', 'yellow');
  log('• Check container logs: docker-compose logs [service-name]', 'yellow');
  log('• Restart containers: docker-compose restart', 'yellow');
  
  log('\nHappy testing! 🚀\n', 'green');
}

function main() {
  logHeader('PFM Frontend Wallet Infrastructure Test');
  
  log('This script will help you test the wallet connection infrastructure', 'bright');
  log('and frontend components with containerized backend services.\n');

  checkPrerequisites();
  checkWalletInfrastructure();
  
  // Offer options to user
  log('\nWhat would you like to do?', 'bright');
  log('1. Install dependencies and start container services');
  log('2. Just show testing instructions');
  log('3. Exit\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your choice (1-3): ', (answer) => {
    rl.close();
    
    switch (answer.trim()) {
      case '1':
        installDependencies();
        setTimeout(() => {
          startContainerServices();
          setTimeout(() => showTestInstructions(), 3000);
        }, 5000);
        break;
      case '2':
        showTestInstructions();
        break;
      case '3':
        log('Goodbye!', 'green');
        process.exit(0);
        break;
      default:
        logError('Invalid choice. Showing instructions...');
        showTestInstructions();
    }
  });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  checkWalletInfrastructure,
  installDependencies,
  startContainerServices,
  showTestInstructions,
}; 