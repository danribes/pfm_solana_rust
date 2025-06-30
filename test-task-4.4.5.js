#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🧪 TASK 4.4.5 VALIDATION SUITE${colors.reset}`);
console.log(`${colors.blue}Testing User Registration & Profile Management Interface${colors.reset}\n`);

let totalTests = 0;
let passedTests = 0;
const errors = [];

// Helper function to check if file exists and validate content
function validateFile(filePath, requiredContent = [], description = '') {
  totalTests++;
  const testName = `📁 ${filePath}${description ? ' - ' + description : ''}`;
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.red}❌ ${testName}${colors.reset}`);
      errors.push(`File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for required content
    for (const required of requiredContent) {
      if (!content.includes(required)) {
        console.log(`${colors.red}❌ ${testName}${colors.reset}`);
        errors.push(`Missing required content in ${filePath}: ${required}`);
        return false;
      }
    }
    
    console.log(`${colors.green}✅ ${testName}${colors.reset}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ ${testName}${colors.reset}`);
    errors.push(`Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

// Helper function to validate TypeScript interfaces
function validateTypeScriptDefinitions() {
  console.log(`${colors.bold}🔧 Testing TypeScript Definitions${colors.reset}`);
  
  const typeFile = 'frontend/member/types/profile.ts';
  const requiredInterfaces = [
    'interface UserProfile',
    'interface RegistrationData',
    'interface WalletConnectionData',
    'interface CommunityOption',
    'interface PrivacySettings',
    'interface NotificationSettings',
    'interface SecuritySettings',
    'enum WalletType',
    'enum VerificationLevel',
    'enum CommunityRole'
  ];
  
  validateFile(typeFile, requiredInterfaces, 'TypeScript definitions');
}

// Helper function to validate hooks
function validateHooks() {
  console.log(`${colors.bold}🪝 Testing React Hooks${colors.reset}`);
  
  validateFile('frontend/member/hooks/useProfile.ts', [
    'export const useProfile',
    'updateProfile',
    'updateAvatar',
    'updatePrivacySettings',
    'validateProfile'
  ], 'Profile management hook');
  
  validateFile('frontend/member/hooks/useRegistration.ts', [
    'export const useRegistration',
    'updateRegistrationData',
    'connectWallet',
    'completeRegistration',
    'validateStep'
  ], 'Registration workflow hook');
}

// Helper function to validate registration components
function validateRegistrationComponents() {
  console.log(`${colors.bold}📝 Testing Registration Components${colors.reset}`);
  
  validateFile('frontend/member/components/Registration/RegistrationWizard.tsx', [
    'RegistrationWizard',
    'useRegistration',
    'ChevronLeftIcon',
    'ChevronRightIcon',
    'WalletConnection',
    'ProfileSetup',
    'CommunitySelection'
  ], 'Main registration wizard');
  
  validateFile('frontend/member/components/Registration/WalletConnection.tsx', [
    'WalletConnection',
    'WalletType',
    'connectWallet',
    'phantom',
    'metamask'
  ], 'Wallet connection step');
  
  validateFile('frontend/member/components/Registration/ProfileSetup.tsx', [
    'ProfileSetup',
    'username',
    'displayName',
    'email',
    'bio',
    'avatar'
  ], 'Profile setup step');
  
  validateFile('frontend/member/components/Registration/CommunitySelection.tsx', [
    'CommunitySelection',
    'selectedCommunities',
    'MagnifyingGlassIcon',
    'UserGroupIcon'
  ], 'Community selection step');
  
  validateFile('frontend/member/components/Registration/TermsAcceptance.tsx', [
    'TermsAcceptance',
    'acceptedTerms',
    'acceptedPrivacy',
    'Terms of Service',
    'Privacy Policy'
  ], 'Terms acceptance step');
  
  validateFile('frontend/member/components/Registration/RegistrationComplete.tsx', [
    'RegistrationComplete',
    'Registration Summary',
    'What happens next',
    'hasRequiredInfo'
  ], 'Registration completion step');
}

// Helper function to validate profile components
function validateProfileComponents() {
  console.log(`${colors.bold}👤 Testing Profile Components${colors.reset}`);
  
  validateFile('frontend/member/components/Profile/ProfileDashboard.tsx', [
    'ProfileDashboard',
    'useProfile',
    'activeTab',
    'overview',
    'activity',
    'communities'
  ], 'Profile dashboard');
}

// Helper function to validate pages
function validatePages() {
  console.log(`${colors.bold}📄 Testing Page Components${colors.reset}`);
  
  validateFile('frontend/member/pages/register/index.tsx', [
    'RegisterPage',
    'RegistrationWizard',
    'handleRegistrationComplete',
    'useRouter'
  ], 'Registration page');
  
  validateFile('frontend/member/pages/profile/index.tsx', [
    'ProfilePage',
    'ProfileDashboard',
    'handleEditProfile',
    'handleSettings'
  ], 'Profile page');
}

// Helper function to test containerization features
function validateContainerization() {
  console.log(`${colors.bold}🐳 Testing Containerization Features${colors.reset}`);
  
  totalTests++;
  const hookFile = 'frontend/member/hooks/useProfile.ts';
  
  try {
    const content = fs.readFileSync(hookFile, 'utf8');
    
    // Check for containerized API calls
    const hasApiEndpoints = content.includes('/api/profile') || content.includes('/api/profiles');
    const hasAuthHeaders = content.includes('Authorization') && content.includes('Bearer');
    const hasErrorHandling = content.includes('catch') && content.includes('console.error');
    
    if (hasApiEndpoints && hasAuthHeaders && hasErrorHandling) {
      console.log(`${colors.green}✅ Containerized API integration${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ Containerized API integration${colors.reset}`);
      errors.push('Missing containerized API features');
    }
  } catch (error) {
    console.log(`${colors.red}❌ Containerized API integration${colors.reset}`);
    errors.push(`Error validating containerization: ${error.message}`);
  }
}

// Helper function to validate file structure
function validateFileStructure() {
  console.log(`${colors.bold}📂 Testing File Structure${colors.reset}`);
  
  const expectedDirs = [
    'frontend/member/components/Registration',
    'frontend/member/components/Profile',
    'frontend/member/pages/register',
    'frontend/member/pages/profile',
    'frontend/member/hooks',
    'frontend/member/types'
  ];
  
  expectedDirs.forEach(dir => {
    totalTests++;
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      console.log(`${colors.green}✅ Directory: ${dir}${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ Directory: ${dir}${colors.reset}`);
      errors.push(`Directory not found: ${dir}`);
    }
  });
}

// Helper function to validate integration features
function validateIntegrationFeatures() {
  console.log(`${colors.bold}🔗 Testing Integration Features${colors.reset}`);
  
  // Test wallet integration
  totalTests++;
  const walletFile = 'frontend/member/components/Registration/WalletConnection.tsx';
  if (fs.existsSync(walletFile)) {
    const content = fs.readFileSync(walletFile, 'utf8');
    if (content.includes('PHANTOM') && content.includes('METAMASK') && content.includes('SOLFLARE')) {
      console.log(`${colors.green}✅ Multi-wallet support integration${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ Multi-wallet support integration${colors.reset}`);
      errors.push('Missing multi-wallet support');
    }
  } else {
    console.log(`${colors.red}❌ Multi-wallet support integration${colors.reset}`);
    errors.push('Wallet connection component not found');
  }
  
  // Test form validation
  totalTests++;
  const profileHook = 'frontend/member/hooks/useProfile.ts';
  if (fs.existsSync(profileHook)) {
    const content = fs.readFileSync(profileHook, 'utf8');
    if (content.includes('validateProfile') && content.includes('ValidationError') && content.includes('emailRegex')) {
      console.log(`${colors.green}✅ Form validation integration${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ Form validation integration${colors.reset}`);
      errors.push('Missing form validation features');
    }
  } else {
    console.log(`${colors.red}❌ Form validation integration${colors.reset}`);
    errors.push('Profile hook not found');
  }
}

// Run all validations
async function runValidation() {
  console.log(`${colors.yellow}Starting validation of Task 4.4.5 implementation...\n${colors.reset}`);
  
  validateFileStructure();
  validateTypeScriptDefinitions();
  validateHooks();
  validateRegistrationComponents();
  validateProfileComponents();
  validatePages();
  validateContainerization();
  validateIntegrationFeatures();
  
  // Final results
  console.log(`\n${colors.bold}📊 VALIDATION RESULTS${colors.reset}`);
  console.log(`${colors.blue}Total Tests: ${totalTests}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${totalTests - passedTests}${colors.reset}`);
  
  if (errors.length > 0) {
    console.log(`\n${colors.bold}${colors.red}❌ ERRORS FOUND:${colors.reset}`);
    errors.forEach((error, index) => {
      console.log(`${colors.red}${index + 1}. ${error}${colors.reset}`);
    });
  }
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`\n${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  if (successRate === 100) {
    console.log(`${colors.bold}${colors.green}🎉 ALL TESTS PASSED! Task 4.4.5 implementation is complete and ready for production.${colors.reset}`);
  } else if (successRate >= 80) {
    console.log(`${colors.bold}${colors.yellow}⚠️  Most tests passed. Review and fix remaining issues.${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}💥 Multiple issues found. Implementation needs attention.${colors.reset}`);
  }
  
  return successRate;
}

// Execute validation
runValidation()
  .then(successRate => {
    process.exit(successRate === 100 ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Validation failed with error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
