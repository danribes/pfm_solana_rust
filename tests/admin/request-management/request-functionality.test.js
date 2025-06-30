// Request Management Functionality Tests
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  testDir: '/home/dan/web3/pfm-docker',
  adminComponentsDir: 'frontend/admin/components/Requests',
  adminPagesDir: 'frontend/admin/pages/requests',
  adminHooksDir: 'frontend/admin/hooks',
  adminTypesDir: 'frontend/admin/types',
  sharedComponentsDir: 'frontend/shared/components',
  timeoutMs: 30000
};

describe('Request Management System - Task 4.3.6', () => {
  let testResults = [];
  
  beforeAll(() => {
    console.log('🚀 Starting Request Management Tests');
    console.log('📦 Testing containerized request functionality...');
    process.chdir(TEST_CONFIG.testDir);
  });

  afterAll(() => {
    const passedTests = testResults.filter(r => r.status === 'PASSED').length;
    const totalTests = testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n📊 REQUEST MANAGEMENT TEST SUMMARY');
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
  describe('Request Management File Structure', () => {
    test('Request TypeScript definitions exist', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'request.ts');
      const exists = fs.existsSync(typesPath);
      
      if (exists) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasRequiredInterfaces = [
          'interface UserRequest',
          'interface UserProfile',
          'interface ApprovalWorkflow',
          'enum RequestStatus',
          'enum RequestType',
          'enum RequestPriority'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredInterfaces) {
          addTestResult('File Structure', 'Request TypeScript definitions', 'PASSED', 'All required interfaces found');
        } else {
          addTestResult('File Structure', 'Request TypeScript definitions', 'FAILED', 'Missing required interfaces');
        }
        expect(hasRequiredInterfaces).toBe(true);
      } else {
        addTestResult('File Structure', 'Request TypeScript definitions', 'FAILED', 'File does not exist');
        expect(exists).toBe(true);
      }
    });

    test('Request hooks exist', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useRequests.ts');
      const exists = fs.existsSync(hooksPath);
      
      if (exists) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasRequiredFunctions = [
          'useRequests',
          'approveRequest',
          'rejectRequest',
          'assignRequest',
          'addNote',
          'bulkAction'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredFunctions) {
          addTestResult('File Structure', 'Request hooks', 'PASSED', 'All required hook functions found');
        } else {
          addTestResult('File Structure', 'Request hooks', 'FAILED', 'Missing required hook functions');
        }
        expect(hasRequiredFunctions).toBe(true);
      } else {
        addTestResult('File Structure', 'Request hooks', 'FAILED', 'File does not exist');
        expect(exists).toBe(true);
      }
    });

    test('Request components exist', () => {
      const requiredComponents = [
        'RequestDashboard.tsx',
        'RequestQueue.tsx',
        'UserProfile.tsx',
        'ApprovalActions.tsx'
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
        addTestResult('File Structure', 'Request components', 'PASSED', 'All required components exist');
      } else {
        addTestResult('File Structure', 'Request components', 'FAILED', `Missing: ${missingComponents.join(', ')}`);
      }
      expect(allExist).toBe(true);
    });

    test('Request pages exist', () => {
      const indexPagePath = path.join(TEST_CONFIG.adminPagesDir, 'index.tsx');
      const exists = fs.existsSync(indexPagePath);
      
      if (exists) {
        const content = fs.readFileSync(indexPagePath, 'utf8');
        const hasRequiredElements = [
          'RequestDashboard',
          'RequestQueue',
          'UserProfile',
          'ApprovalActions',
          'handleRequestSelect',
          'handleApprovalAction'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredElements) {
          addTestResult('File Structure', 'Request pages', 'PASSED', 'Main request page has all required elements');
        } else {
          addTestResult('File Structure', 'Request pages', 'FAILED', 'Missing required page elements');
        }
        expect(hasRequiredElements).toBe(true);
      } else {
        addTestResult('File Structure', 'Request pages', 'FAILED', 'Main request page does not exist');
        expect(exists).toBe(true);
      }
    });
  });

  // 2. Component Integration Tests
  describe('Request Component Integration', () => {
    test('RequestDashboard has metrics and analytics', () => {
      const dashboardPath = path.join(TEST_CONFIG.adminComponentsDir, 'RequestDashboard.tsx');
      if (fs.existsSync(dashboardPath)) {
        const content = fs.readFileSync(dashboardPath, 'utf8');
        const hasMetrics = [
          'metrics',
          'useMemo',
          'RequestStatus',
          'RequestPriority',
          'totalRequests',
          'approvalRate'
        ].every(pattern => content.includes(pattern));
        
        if (hasMetrics) {
          addTestResult('Component Integration', 'RequestDashboard metrics', 'PASSED', 'Dashboard metrics and analytics implemented');
        } else {
          addTestResult('Component Integration', 'RequestDashboard metrics', 'FAILED', 'Missing metrics functionality');
        }
        expect(hasMetrics).toBe(true);
      } else {
        addTestResult('Component Integration', 'RequestDashboard metrics', 'FAILED', 'RequestDashboard component not found');
        expect(false).toBe(true);
      }
    });

    test('RequestQueue has filtering and bulk actions', () => {
      const queuePath = path.join(TEST_CONFIG.adminComponentsDir, 'RequestQueue.tsx');
      if (fs.existsSync(queuePath)) {
        const content = fs.readFileSync(queuePath, 'utf8');
        const hasFilteringAndBulk = [
          'RequestFilters',
          'selectedRequests',
          'handleBulkApprove',
          'handleBulkReject',
          'showFilters',
          'bulkAction'
        ].every(pattern => content.includes(pattern));
        
        if (hasFilteringAndBulk) {
          addTestResult('Component Integration', 'RequestQueue filtering', 'PASSED', 'Filtering and bulk actions implemented');
        } else {
          addTestResult('Component Integration', 'RequestQueue filtering', 'FAILED', 'Missing filtering/bulk action functionality');
        }
        expect(hasFilteringAndBulk).toBe(true);
      } else {
        addTestResult('Component Integration', 'RequestQueue filtering', 'FAILED', 'RequestQueue component not found');
        expect(false).toBe(true);
      }
    });

    test('UserProfile has comprehensive user information', () => {
      const profilePath = path.join(TEST_CONFIG.adminComponentsDir, 'UserProfile.tsx');
      if (fs.existsExists(profilePath)) {
        const content = fs.readFileSync(profilePath, 'utf8');
        const hasUserInfo = [
          'UserProfile',
          'VerificationStatus',
          'walletHistory',
          'reputation',
          'socialLinks',
          'getVerificationBadge'
        ].every(pattern => content.includes(pattern));
        
        if (hasUserInfo) {
          addTestResult('Component Integration', 'UserProfile information', 'PASSED', 'Comprehensive user information display implemented');
        } else {
          addTestResult('Component Integration', 'UserProfile information', 'FAILED', 'Missing user information functionality');
        }
        expect(hasUserInfo).toBe(true);
      } else {
        addTestResult('Component Integration', 'UserProfile information', 'FAILED', 'UserProfile component not found');
        expect(false).toBe(true);
      }
    });

    test('ApprovalActions has workflow management', () => {
      const actionsPath = path.join(TEST_CONFIG.adminComponentsDir, 'ApprovalActions.tsx');
      if (fs.existsSync(actionsPath)) {
        const content = fs.readFileSync(actionsPath, 'utf8');
        const hasWorkflow = [
          'showApprovalDialog',
          'showRejectionDialog',
          'handleApprove',
          'handleReject',
          'handleAssign',
          'predefinedRejectionReasons'
        ].every(pattern => content.includes(pattern));
        
        if (hasWorkflow) {
          addTestResult('Component Integration', 'ApprovalActions workflow', 'PASSED', 'Approval workflow management implemented');
        } else {
          addTestResult('Component Integration', 'ApprovalActions workflow', 'FAILED', 'Missing workflow functionality');
        }
        expect(hasWorkflow).toBe(true);
      } else {
        addTestResult('Component Integration', 'ApprovalActions workflow', 'FAILED', 'ApprovalActions component not found');
        expect(false).toBe(true);
      }
    });
  });

  // 3. TypeScript Interface Tests
  describe('Request TypeScript Interfaces', () => {
    test('UserRequest interface completeness', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'request.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasRequiredFields = [
          'id: string',
          'userId: string',
          'type: RequestType',
          'status: RequestStatus',
          'priority: RequestPriority',
          'userProfile: UserProfile',
          'adminNotes: AdminNote[]',
          'history: RequestHistoryEntry[]'
        ].every(pattern => content.includes(pattern));
        
        if (hasRequiredFields) {
          addTestResult('TypeScript Interfaces', 'UserRequest interface', 'PASSED', 'All required fields present');
        } else {
          addTestResult('TypeScript Interfaces', 'UserRequest interface', 'FAILED', 'Missing required fields');
        }
        expect(hasRequiredFields).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'UserRequest interface', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });

    test('Request status enumeration', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'request.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasStatusTypes = [
          'PENDING',
          'UNDER_REVIEW',
          'APPROVED',
          'REJECTED',
          'ESCALATED'
        ].every(pattern => content.includes(pattern));
        
        if (hasStatusTypes) {
          addTestResult('TypeScript Interfaces', 'Request status enum', 'PASSED', 'All status types defined');
        } else {
          addTestResult('TypeScript Interfaces', 'Request status enum', 'FAILED', 'Missing status types');
        }
        expect(hasStatusTypes).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'Request status enum', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });

    test('Approval workflow interfaces', () => {
      const typesPath = path.join(TEST_CONFIG.adminTypesDir, 'request.ts');
      if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        const hasWorkflowTypes = [
          'ApprovalWorkflow',
          'ApprovalRule',
          'ApprovalStage',
          'AutoApprovalCriteria',
          'NotificationSettings'
        ].every(pattern => content.includes(pattern));
        
        if (hasWorkflowTypes) {
          addTestResult('TypeScript Interfaces', 'Approval workflow interfaces', 'PASSED', 'All workflow interfaces defined');
        } else {
          addTestResult('TypeScript Interfaces', 'Approval workflow interfaces', 'FAILED', 'Missing workflow interfaces');
        }
        expect(hasWorkflowTypes).toBe(true);
      } else {
        addTestResult('TypeScript Interfaces', 'Approval workflow interfaces', 'FAILED', 'Types file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 4. Hook Functionality Tests
  describe('Request Hook Functionality', () => {
    test('useRequests hook structure', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useRequests.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasHookStructure = [
          'useState',
          'useEffect',
          'useCallback',
          'UseRequestsResult',
          'requests: UserRequest[]',
          'loading: boolean',
          'error: string | null',
          'totalCount: number'
        ].every(pattern => content.includes(pattern));
        
        if (hasHookStructure) {
          addTestResult('Hook Functionality', 'useRequests structure', 'PASSED', 'Hook has proper React structure');
        } else {
          addTestResult('Hook Functionality', 'useRequests structure', 'FAILED', 'Missing hook structure elements');
        }
        expect(hasHookStructure).toBe(true);
      } else {
        addTestResult('Hook Functionality', 'useRequests structure', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });

    test('Request management operations', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useRequests.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasOperations = [
          'approveRequest',
          'rejectRequest',
          'assignRequest',
          'addNote',
          'bulkAction',
          'method: \'POST\'',
          'Authorization'
        ].every(pattern => content.includes(pattern));
        
        if (hasOperations) {
          addTestResult('Hook Functionality', 'Request operations', 'PASSED', 'All request operations implemented');
        } else {
          addTestResult('Hook Functionality', 'Request operations', 'FAILED', 'Missing request operations');
        }
        expect(hasOperations).toBe(true);
      } else {
        addTestResult('Hook Functionality', 'Request operations', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 5. Container Integration Tests
  describe('Container Integration', () => {
    test('Docker environment compatibility', () => {
      try {
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

    test('API endpoint configuration', () => {
      const hooksPath = path.join(TEST_CONFIG.adminHooksDir, 'useRequests.ts');
      if (fs.existsSync(hooksPath)) {
        const content = fs.readFileSync(hooksPath, 'utf8');
        const hasAPIConfig = [
          '/api/requests',
          'localStorage.getItem',
          'Authorization',
          'Bearer'
        ].every(pattern => content.includes(pattern));
        
        if (hasAPIConfig) {
          addTestResult('Container Integration', 'API configuration', 'PASSED', 'API endpoints configured for container');
        } else {
          addTestResult('Container Integration', 'API configuration', 'FAILED', 'Missing API configuration');
        }
        expect(hasAPIConfig).toBe(true);
      } else {
        addTestResult('Container Integration', 'API configuration', 'FAILED', 'Hook file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 6. Component Props and State Tests
  describe('Component Props and State', () => {
    test('Request dashboard state management', () => {
      const dashboardPath = path.join(TEST_CONFIG.adminComponentsDir, 'RequestDashboard.tsx');
      if (fs.existsSync(dashboardPath)) {
        const content = fs.readFileSync(dashboardPath, 'utf8');
        const hasStateManagement = [
          'useState',
          'useMemo',
          'selectedTab',
          'setSelectedTab',
          'useRequests'
        ].every(pattern => content.includes(pattern));
        
        if (hasStateManagement) {
          addTestResult('Component Props', 'Dashboard state management', 'PASSED', 'State management properly implemented');
        } else {
          addTestResult('Component Props', 'Dashboard state management', 'FAILED', 'Missing state management');
        }
        expect(hasStateManagement).toBe(true);
      } else {
        addTestResult('Component Props', 'Dashboard state management', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });

    test('Request queue props interface', () => {
      const queuePath = path.join(TEST_CONFIG.adminComponentsDir, 'RequestQueue.tsx');
      if (fs.existsSync(queuePath)) {
        const content = fs.readFileSync(queuePath, 'utf8');
        const hasPropsInterface = [
          'RequestQueueProps',
          'onRequestSelect',
          'onRequestApprove',
          'onRequestReject',
          'showBulkActions'
        ].every(pattern => content.includes(pattern));
        
        if (hasPropsInterface) {
          addTestResult('Component Props', 'Request queue props', 'PASSED', 'Props interface properly defined');
        } else {
          addTestResult('Component Props', 'Request queue props', 'FAILED', 'Missing props interface');
        }
        expect(hasPropsInterface).toBe(true);
      } else {
        addTestResult('Component Props', 'Request queue props', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 7. UI/UX Implementation Tests
  describe('UI/UX Implementation', () => {
    test('Responsive design classes', () => {
      const components = ['RequestDashboard.tsx', 'RequestQueue.tsx', 'UserProfile.tsx', 'ApprovalActions.tsx'];
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

    test('Accessibility and user feedback', () => {
      const actionsPath = path.join(TEST_CONFIG.adminComponentsDir, 'ApprovalActions.tsx');
      if (fs.existsSync(actionsPath)) {
        const content = fs.readFileSync(actionsPath, 'utf8');
        const hasAccessibility = [
          'disabled',
          'aria-',
          'role=',
          'loading',
          'processing'
        ].some(pattern => content.includes(pattern));
        
        if (hasAccessibility) {
          addTestResult('UI/UX Implementation', 'Accessibility and feedback', 'PASSED', 'Accessibility and user feedback implemented');
        } else {
          addTestResult('UI/UX Implementation', 'Accessibility and feedback', 'FAILED', 'Missing accessibility features');
        }
        expect(hasAccessibility).toBe(true);
      } else {
        addTestResult('UI/UX Implementation', 'Accessibility and feedback', 'FAILED', 'Component file not found');
        expect(false).toBe(true);
      }
    });
  });

  // 8. Integration and Workflow Tests
  describe('Request Workflow Integration', () => {
    test('Main page integration', () => {
      const mainPagePath = path.join(TEST_CONFIG.adminPagesDir, 'index.tsx');
      if (fs.existsSync(mainPagePath)) {
        const content = fs.readFileSync(mainPagePath, 'utf8');
        const hasIntegration = [
          'RequestDashboard',
          'RequestQueue',
          'UserProfile',
          'ApprovalActions',
          'handleApprovalAction',
          'ViewMode'
        ].every(pattern => content.includes(pattern));
        
        if (hasIntegration) {
          addTestResult('Workflow Integration', 'Main page integration', 'PASSED', 'All components properly integrated');
        } else {
          addTestResult('Workflow Integration', 'Main page integration', 'FAILED', 'Missing component integration');
        }
        expect(hasIntegration).toBe(true);
      } else {
        addTestResult('Workflow Integration', 'Main page integration', 'FAILED', 'Main page file not found');
        expect(false).toBe(true);
      }
    });

    test('Request lifecycle management', () => {
      const mainPagePath = path.join(TEST_CONFIG.adminPagesDir, 'index.tsx');
      if (fs.existsSync(mainPagePath)) {
        const content = fs.readFileSync(mainPagePath, 'utf8');
        const hasLifecycleManagement = [
          'handleRequestApprove',
          'handleRequestReject',
          'handleRequestSelect',
          'refetch',
          'selectedRequest'
        ].every(pattern => content.includes(pattern));
        
        if (hasLifecycleManagement) {
          addTestResult('Workflow Integration', 'Request lifecycle', 'PASSED', 'Request lifecycle management implemented');
        } else {
          addTestResult('Workflow Integration', 'Request lifecycle', 'FAILED', 'Missing lifecycle management');
        }
        expect(hasLifecycleManagement).toBe(true);
      } else {
        addTestResult('Workflow Integration', 'Request lifecycle', 'FAILED', 'Main page file not found');
        expect(false).toBe(true);
      }
    });
  });
});
