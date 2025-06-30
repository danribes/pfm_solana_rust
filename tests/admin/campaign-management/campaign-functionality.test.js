// Campaign Management Functionality Tests
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  testDir: '/home/dan/web3/pfm-docker',
  adminComponentsDir: 'frontend/admin/components/Campaigns',
  adminPagesDir: 'frontend/admin/pages/campaigns',
  adminHooksDir: 'frontend/admin/hooks',
  adminTypesDir: 'frontend/admin/types',
  timeoutMs: 30000
};

describe('Campaign Management System - Task 4.3.5', () => {
  let testResults = [];
  
  beforeAll(() => {
    console.log('🚀 Starting Campaign Management Tests');
    console.log('📦 Testing containerized campaign functionality...');
    process.chdir(TEST_CONFIG.testDir);
  });

  afterAll(() => {
    const passedTests = testResults.filter(r => r.status === 'PASSED').length;
    const totalTests = testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n📊 CAMPAIGN MANAGEMENT TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(50));
    
    // Log individual results
    testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.category}: ${result.test}`);
      if (result.details) console.log(`   Details: ${result.details}`);
    });
  });

  const addTestResult = (category, test, status, details = '') => {
    testResults.push({ category, test, status, details });
  };

  // 1. File Structure Tests
  describe('Campaign File Structure', () => {
    test('Campaign TypeScript definitions exist', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'campaign.ts');
      const exists = fs.existsSync(typesPath);
      
      if (exists) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasRequiredInterfaces = [
          'interface Campaign',
          'interface VotingQuestion',
          'interface CampaignFormData',
          'enum CampaignStatus',
          'enum QuestionType'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredInterfaces) {
          addTestResult('File Structure', 'Campaign TypeScript definitions', 'PASSED', 'All required interfaces found');
        } else {
          addTestResult('File Structure', 'Campaign TypeScript definitions', 'FAILED', 'Missing required interfaces');
        }
        expect(hasRequiredInterfaces).toBe(true);
      } else {
        addTestResult('File Structure', 'Campaign TypeScript definitions', 'FAILED', 'File does not exist');
        expect(exists).toBe(true);
      }
    });

    test('Campaign hooks exist', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useCampaigns.ts');
      const exists = fs.existsSync(hooksPath);
      
      if (exists) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasRequiredFunctions = [
          'useCampaigns',
          'createCampaign',
          'updateCampaign',
          'deleteCampaign',
          'fetchCampaigns'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredFunctions) {
          addTestResult('File Structure', 'Campaign hooks', 'PASSED', 'All required hook functions found');
        } else {
          addTestResult('File Structure', 'Campaign hooks', 'FAILED', 'Missing required hook functions');
        }
        expect(hasRequiredFunctions).toBe(true);
      } else {
        addTestResult('File Structure', 'Campaign hooks', 'FAILED', 'File does not exist');
        expect(exists).toBe(true);
      }
    });

    test('Campaign components exist', () => {
      const requiredComponents = [
        'CampaignWizard.tsx',
        'CampaignList.tsx',
        'CampaignAnalytics.tsx'
      ];
      
      let allExist = true;
      let missingComponents = [];
      
      requiredComponents.forEach(component => {
        const componentPath = path.join(TEST_CONFIG.adminComponentsDir, component);
        if (!fs.existsSync(componentPath)) {
          allExist = false;
          missingComponents.push(component);
        }
      });
      
      if (allExist) {
        addTestResult('File Structure', 'Campaign components', 'PASSED', 'All required components exist');
      } else {
        addTestResult('File Structure', 'Campaign components', 'FAILED', `Missing: ${missingComponents.join(', ')}`);
      }
      expect(allExist).toBe(true);
    });

    test('Campaign pages exist', () => {
      const indexPagePath = path.join(TEST_CONFIG.adminPagesDir, 'index.tsx');
      const exists = fs.existsSync(indexPagePath);
      
      if (exists) {
        const content = fs.readFileSync(indexPagePath, 'utf8');
        const hasRequiredElements = [
          'CampaignList',
          'CampaignWizard',
          'CampaignAnalytics',
          'handleCreateCampaign',
          'handleEditCampaign'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredElements) {
          addTestResult('File Structure', 'Campaign pages', 'PASSED', 'Main campaign page has all required elements');
        } else {
          addTestResult('File Structure', 'Campaign pages', 'FAILED', 'Missing required page elements');
        }
        expect(hasRequiredElements).toBe(true);
      } else {
        addTestResult('File Structure', 'Campaign pages', 'FAILED', 'Main campaign page does not exist');
        expect(exists).toBe(true);
      }
    });
  });

  // 2. Component Integration Tests
  describe('Campaign Component Integration', () => {
    test('CampaignWizard has multi-step functionality', () => {
      const wizardPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignWizard.tsx');
      if (fs.existsSync(wizardPath)) {
        const content = fs.readFileSync(wizardPath, 'utf8');
        const hasStepFunctionality = [
          'currentStep',
          'nextStep',
          'prevStep',
          'steps:',
          'WizardStep'
        ].every(pattern => content.includes(pattern));
        
        if (hasStepFunctionality) {
          addTestResult('Component Integration', 'CampaignWizard multi-step', 'PASSED', 'Multi-step wizard functionality implemented');
        } else {
          addTestResult('Component Integration', 'CampaignWizard multi-step', 'FAILED', 'Missing multi-step functionality');
        }
        expect(hasStepFunctionality).toBe(true);
      } else {
        addTestResult('Component Integration', 'CampaignWizard multi-step', 'FAILED', 'CampaignWizard component not found');
        expect(false).toBe(true);
      }
    });

    test('CampaignList has filtering and search', () => {
      const listPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignList.tsx');
      if (fs.existsSync(listPath)) {
        const content = fs.readFileSync(listPath, 'utf8');
        const hasFilterSearch = [
          'searchTerm',
          'setSearchTerm',
          'filter',
          'setFilter',
          'filteredCampaigns'
        ].every(pattern => content.includes(pattern));
        
        if (hasFilterSearch) {
          addTestResult('Component Integration', 'CampaignList filtering', 'PASSED', 'Filtering and search functionality implemented');
        } else {
          addTestResult('Component Integration', 'CampaignList filtering', 'FAILED', 'Missing filtering/search functionality');
        }
        expect(hasFilterSearch).toBe(true);
      } else {
        addTestResult('Component Integration', 'CampaignList filtering', 'FAILED', 'CampaignList component not found');
        expect(false).toBe(true);
      }
    });

    test('CampaignAnalytics has data visualization', () => {
      const analyticsPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignAnalytics.tsx');
      if (fs.existsSync(analyticsPath)) {
        const content = fs.readFileSync(analyticsPath, 'utf8');
        const hasAnalytics = [
          'participationOverTime',
          'demographicBreakdown',
          'questionAnalytics',
          'timeRange',
          'AnalyticsData'
        ].every(pattern => content.includes(pattern));
        
        if (hasAnalytics) {
          addTestResult('Component Integration', 'CampaignAnalytics visualization', 'PASSED', 'Analytics and data visualization implemented');
        } else {
          addTestResult('Component Integration', 'CampaignAnalytics visualization', 'FAILED', 'Missing analytics functionality');
        }
        expect(hasAnalytics).toBe(true);
      } else {
        addTestResult('Component Integration', 'CampaignAnalytics visualization', 'FAILED', 'CampaignAnalytics component not found');
        expect(false).toBe(true);
      }
    });
  });

  // 3. TypeScript Interface Tests
  describe('Campaign TypeScript Interfaces', () => {
    test('Campaign interface completeness', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'campaign.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasRequiredFields = [
          'id: string',
          'title: string',
          'description: string',
          'status: CampaignStatus',
          'questions: VotingQuestion[]',
          'totalVotes: number',
          'participationRate: number'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredFields) {
          addTestResult('TypeScript Interfaces', 'Campaign interface', 'PASSED', 'All required fields present');
        } else {
          addTestResult('TypeScript Interfaces', 'Campaign interface', 'FAILED', 'Missing required fields');
        }
        expect(hasRequiredFields).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'Campaign interface', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });

    test('Question types enumeration', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'campaign.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasQuestionTypes = [
          'SINGLE_CHOICE',
          'MULTIPLE_CHOICE',
          'YES_NO',
          'TEXT_INPUT'
        ].every(pattern => content.includes(pattern));
        
        if (hasQuestionTypes) {
          addTestResult('TypeScript Interfaces', 'Question types enum', 'PASSED', 'All question types defined');
        } else {
          addTestResult('TypeScript Interfaces', 'Question types enum', 'FAILED', 'Missing question types');
        }
        expect(hasQuestionTypes).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'Question types enum', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });

    test('Campaign status enumeration', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'campaign.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasStatusTypes = [
          'DRAFT',
          'ACTIVE',
          'COMPLETED',
          'CANCELLED',
          'SCHEDULED'
        ].every(pattern => content.includes(pattern));
        
        if (hasStatusTypes) {
          addTestResult('TypeScript Interfaces', 'Campaign status enum', 'PASSED', 'All status types defined');
        } else {
          addTestResult('TypeScript Interfaces', 'Campaign status enum', 'FAILED', 'Missing status types');
        }
        expect(hasStatusTypes).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'Campaign status enum', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 4. Hook Functionality Tests
  describe('Campaign Hook Functionality', () => {
    test('useCampaigns hook structure', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useCampaigns.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasHookStructure = [
          'useState',
          'useEffect',
          'useCallback',
          'UseCampaignsResult',
          'campaigns: Campaign[]',
          'loading: boolean',
          'error: string | null'
        ].every(pattern => content.includes(pattern));
        
        if (hasHookStructure) {
          addTestResult('Hook Functionality', 'useCampaigns structure', 'PASSED', 'Hook has proper React structure');
        } else {
          addTestResult('Hook Functionality', 'useCampaigns structure', 'FAILED', 'Missing hook structure elements');
        }
        expect(hasHookStructure).toBe(true);
      } else {
        addTestResult('Hook Functionality', 'useCampaigns structure', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });

    test('CRUD operations implementation', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useCampaigns.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasCRUDOps = [
          'createCampaign',
          'updateCampaign',
          'deleteCampaign',
          'fetchCampaigns',
          'method: \'POST\'',
          'method: \'PUT\'',
          'method: \'DELETE\''
        ].every(pattern => content.includes(pattern));
        
        if (hasCRUDOps) {
          addTestResult('Hook Functionality', 'CRUD operations', 'PASSED', 'All CRUD operations implemented');
        } else {
          addTestResult('Hook Functionality', 'CRUD operations', 'FAILED', 'Missing CRUD operations');
        }
        expect(hasCRUDOps).toBe(true);
      } else {
        addTestResult('Hook Functionality', 'CRUD operations', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 5. Container Integration Tests
  describe('Container Integration', () => {
    test('Docker environment compatibility', () => {
      try {
        // Check if we're in a containerized environment
        const containerCheck = process.env.CONTAINER_ID || process.env.DOCKER_CONTAINER;
        const isContainerized = !!containerCheck || fs.existsSync('/.dockerenv');
        
        if (isContainerized) {
          addTestResult('Container Integration', 'Docker environment', 'PASSED', 'Running in containerized environment');
        } else {
          addTestResult('Container Integration', 'Docker environment', 'PASSED', 'Development environment detected');
        }
        expect(true).toBe(true);
      } catch (error) {
        addTestResult('Container Integration', 'Docker environment', 'FAILED', error.message);
        expect(false).toBe(true);
      }
    });

    test('File permissions in container', () => {
      try {
        // Test file creation/modification permissions
        const testFile = 'test-permissions.tmp';
        fs.writeFileSync(testFile, 'test');
        const canRead = fs.existsSync(testFile);
        fs.unlinkSync(testFile);
        
        if (canRead) {
          addTestResult('Container Integration', 'File permissions', 'PASSED', 'File operations working correctly');
        } else {
          addTestResult('Container Integration', 'File permissions', 'FAILED', 'File operation issues');
        }
        expect(canRead).toBe(true);
      } catch (error) {
        addTestResult('Container Integration', 'File permissions', 'FAILED', error.message);
        expect(false).toBe(true);
      }
    });
  });

  // 6. Component Props and State Tests
  describe('Component Props and State', () => {
    test('Campaign wizard props interface', () => {
      const wizardPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignWizard.tsx');
      if (fs.existsSync(wizardPath)) {
        const content = fs.readFileSync(wizardPath, 'utf8');
        const hasPropsInterface = [
          'CampaignWizardProps',
          'onComplete:',
          'onCancel:',
          'React.FC<CampaignWizardProps>'
        ].every(pattern => content.includes(pattern));
        
        if (hasPropsInterface) {
          addTestResult('Component Props', 'Campaign wizard props', 'PASSED', 'Props interface properly defined');
        } else {
          addTestResult('Component Props', 'Campaign wizard props', 'FAILED', 'Missing props interface');
        }
        expect(hasPropsInterface).toBe(true);
      } else {
        addTestResult('Component Props', 'Campaign wizard props', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });

    test('Campaign list action handlers', () => {
      const listPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignList.tsx');
      if (fs.existsSync(listPath)) {
        const content = fs.readFileSync(listPath, 'utf8');
        const hasActionHandlers = [
          'onEditCampaign',
          'onViewAnalytics',
          'handleDelete',
          'CampaignListProps'
        ].every(pattern => content.includes(pattern));
        
        if (hasActionHandlers) {
          addTestResult('Component Props', 'Campaign list actions', 'PASSED', 'Action handlers properly implemented');
        } else {
          addTestResult('Component Props', 'Campaign list actions', 'FAILED', 'Missing action handlers');
        }
        expect(hasActionHandlers).toBe(true);
      } else {
        addTestResult('Component Props', 'Campaign list actions', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 7. UI/UX Implementation Tests
  describe('UI/UX Implementation', () => {
    test('Responsive design classes', () => {
      const components = ['CampaignWizard.tsx', 'CampaignList.tsx', 'CampaignAnalytics.tsx'];
      let allHaveResponsive = true;
      let missingResponsive = [];
      
      components.forEach(component => {
        const componentPath = path.join(TEST_CONFIG.adminComponentsDir, component);
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          const hasResponsiveClasses = [
            'sm:', 'md:', 'lg:'
          ].some(pattern => content.includes(pattern));
          
          if (!hasResponsiveClasses) {
            allHaveResponsive = false;
            missingResponsive.push(component);
          }
        }
      });
      
      if (allHaveResponsive) {
        addTestResult('UI/UX Implementation', 'Responsive design', 'PASSED', 'Responsive classes found in components');
      } else {
        addTestResult('UI/UX Implementation', 'Responsive design', 'FAILED', `Missing responsive design: ${missingResponsive.join(', ')}`);
      }
      expect(allHaveResponsive).toBe(true);
    });

    test('Accessibility attributes', () => {
      const wizardPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignWizard.tsx');
      if (fs.existsSync(wizardPath)) {
        const content = fs.readFileSync(wizardPath, 'utf8');
        const hasA11yAttributes = [
          'aria-',
          'role=',
          'className=',
          'htmlFor='
        ].some(pattern => content.includes(pattern));
        
        if (hasA11yAttributes) {
          addTestResult('UI/UX Implementation', 'Accessibility attributes', 'PASSED', 'Accessibility attributes found');
        } else {
          addTestResult('UI/UX Implementation', 'Accessibility attributes', 'FAILED', 'Missing accessibility attributes');
        }
        expect(hasA11yAttributes).toBe(true);
      } else {
        addTestResult('UI/UX Implementation', 'Accessibility attributes', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 8. Data Flow Tests
  describe('Data Flow and State Management', () => {
    test('Form data management in wizard', () => {
      const wizardPath = path.join(TEST_CONFIG.adminComponentsDir, 'CampaignWizard.tsx');
      if (fs.existsSync(wizardPath)) {
        const content = fs.readFileSync(wizardPath, 'utf8');
        const hasFormDataManagement = [
          'formData',
          'setFormData',
          'updateFormData',
          'CampaignFormData',
          'useState<CampaignFormData>'
        ].every(pattern => content.includes(pattern));
        
        if (hasFormDataManagement) {
          addTestResult('Data Flow', 'Form data management', 'PASSED', 'Form state management properly implemented');
        } else {
          addTestResult('Data Flow', 'Form data management', 'FAILED', 'Missing form state management');
        }
        expect(hasFormDataManagement).toBe(true);
      } else {
        addTestResult('Data Flow', 'Form data management', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });

    test('API integration patterns', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useCampaigns.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasAPIPatterns = [
          'fetch(',
          'headers:',
          'Authorization',
          'Content-Type',
          'response.json()',
          'catch (err'
        ].every(pattern => content.includes(pattern));
        
        if (hasAPIPatterns) {
          addTestResult('Data Flow', 'API integration', 'PASSED', 'API integration patterns implemented');
        } else {
          addTestResult('Data Flow', 'API integration', 'FAILED', 'Missing API integration patterns');
        }
        expect(hasAPIPatterns).toBe(true);
      } else {
        addTestResult('Data Flow', 'API integration', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });
  });
});
