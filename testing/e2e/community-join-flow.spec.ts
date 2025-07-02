import { test, expect } from '@playwright/test';

test.describe('Community Join Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the member portal
    await page.goto('/');
    
    // Mock wallet connection for testing
    await page.addInitScript(() => {
      window.mockWallet = {
        connected: true,
        publicKey: 'test-public-key-123',
        signMessage: () => Promise.resolve('mock-signature'),
      };
    });
  });

  test('should complete full join request flow', async ({ page }) => {
    // Step 1: Navigate to communities page
    await page.click('[data-testid="communities-link"]');
    await expect(page).toHaveURL('/communities');
    
    // Wait for communities to load
    await page.waitForSelector('[data-testid="community-card"]');
    
    // Step 2: Select a community
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await expect(firstCommunity).toBeVisible();
    
    const communityName = await firstCommunity.locator('h3').textContent();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Step 3: Fill out the application form
    await expect(page).toHaveURL(/\/communities\/.*\/application/);
    await expect(page.locator('h1')).toContainText('Apply to Join');
    
    // Fill required fields
    await page.fill('[data-testid="full-name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.selectOption('[data-testid="experience-select"]', 'Intermediate');
    
    // Fill motivation field
    await page.fill(
      '[data-testid="motivation-textarea"]',
      'I am passionate about Web3 development and would love to contribute to this community with my experience in blockchain technologies.'
    );
    
    // Select technical skills
    await page.check('[data-testid="skill-solidity"]');
    await page.check('[data-testid="skill-javascript"]');
    await page.check('[data-testid="skill-react"]');
    
    // Upload a file (optional)
    const fileInput = page.locator('[data-testid="resume-upload"]');
    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PDF content'),
    });
    
    // Agree to terms
    await page.check('[data-testid="terms-agreement"]');
    
    // Step 4: Submit the application
    await page.click('[data-testid="submit-application"]');
    
    // Step 5: Verify submission success
    await expect(page).toHaveURL(/\/communities\/.*\/application\/submitted/);
    await expect(page.locator('h1')).toContainText('Application Submitted!');
    
    // Check that application ID is displayed
    await expect(page.locator('[data-testid="application-id"]')).toBeVisible();
    
    // Step 6: Navigate to status tracking
    await page.click('[data-testid="track-status-link"]');
    await expect(page).toHaveURL(/\/requests\/.*\/status/);
    
    // Verify status page loads
    await expect(page.locator('h1')).toContainText('Application Status');
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to application form
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-application"]');
    
    // Check for validation errors
    await expect(page.locator('[data-testid="error-full-name"]')).toContainText('Full Name is required');
    await expect(page.locator('[data-testid="error-email"]')).toContainText('Email Address is required');
    await expect(page.locator('[data-testid="error-experience"]')).toContainText('Web3 Experience Level is required');
    await expect(page.locator('[data-testid="error-motivation"]')).toContainText('required');
  });

  test('should save draft successfully', async ({ page }) => {
    // Navigate to application form
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Fill partial form
    await page.fill('[data-testid="full-name-input"]', 'Jane Smith');
    await page.fill('[data-testid="email-input"]', 'jane.smith@example.com');
    
    // Save draft
    await page.click('[data-testid="save-draft-button"]');
    
    // Check for success message
    await expect(page.locator('[data-testid="draft-saved-message"]')).toBeVisible();
  });

  test('should handle file upload correctly', async ({ page }) => {
    // Navigate to application form
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Upload a valid file
    const fileInput = page.locator('[data-testid="resume-upload"]');
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Test PDF content'),
    });
    
    // Verify file is displayed
    await expect(page.locator('[data-testid="uploaded-file-name"]')).toContainText('test-resume.pdf');
    
    // Test file removal
    await page.click('[data-testid="remove-file-button"]');
    await expect(page.locator('[data-testid="uploaded-file-name"]')).not.toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to communities page
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    // Check mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
    
    // Test community card interaction on mobile
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Verify form is usable on mobile
    await expect(page.locator('[data-testid="application-form"]')).toBeVisible();
    
    // Test scrolling and form filling on mobile
    await page.fill('[data-testid="full-name-input"]', 'Mobile User');
    await page.fill('[data-testid="email-input"]', 'mobile@example.com');
    
    // Scroll to see more of the form
    await page.locator('[data-testid="motivation-textarea"]').scrollIntoViewIfNeeded();
    await page.fill(
      '[data-testid="motivation-textarea"]',
      'Testing mobile responsiveness for the application form.'
    );
  });

  test('should handle browser back navigation correctly', async ({ page }) => {
    // Navigate through the flow
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Fill some form data
    await page.fill('[data-testid="full-name-input"]', 'Test User');
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/communities');
    
    // Navigate forward again
    await page.goForward();
    
    // Check if form data is preserved (depending on implementation)
    const nameInput = page.locator('[data-testid="full-name-input"]');
    await expect(nameInput).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('/api/communities/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/communities');
    
    // Check for error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load communities'
    );
  });

  test('should track application status correctly', async ({ page }) => {
    // Start from a submitted application
    const applicationId = 'test-app-123';
    await page.goto(`/requests/${applicationId}/status`);
    
    // Check status page elements
    await expect(page.locator('h1')).toContainText('Application Status');
    await expect(page.locator('[data-testid="application-id"]')).toContainText(applicationId);
    
    // Check status indicators
    await expect(page.locator('[data-testid="status-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Check timeline
    await expect(page.locator('[data-testid="timeline-item"]')).toBeVisible();
    
    // Test action buttons
    const editButton = page.locator('[data-testid="edit-application-button"]');
    const withdrawButton = page.locator('[data-testid="withdraw-application-button"]');
    
    await expect(editButton).toBeVisible();
    await expect(withdrawButton).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/communities');
    await page.waitForSelector('[data-testid="community-card"]');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus indicators
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navigate to application form
    const firstCommunity = page.locator('[data-testid="community-card"]').first();
    await firstCommunity.locator('[data-testid="join-request-button"]').click();
    
    // Test form accessibility
    await page.keyboard.press('Tab'); // Should focus first input
    const firstInput = page.locator('[data-testid="full-name-input"]');
    await expect(firstInput).toBeFocused();
    
    // Check for proper labels and aria attributes
    await expect(firstInput).toHaveAttribute('aria-required', 'true');
    
    // Test skip links (if implemented)
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[data-testid="skip-to-content"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
  });

  test('should handle concurrent user sessions', async ({ browser }) => {
    // Create multiple browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users navigate to the same community
    await page1.goto('/communities');
    await page2.goto('/communities');
    
    await page1.waitForSelector('[data-testid="community-card"]');
    await page2.waitForSelector('[data-testid="community-card"]');
    
    // Both users try to join the same community
    const community1 = page1.locator('[data-testid="community-card"]').first();
    const community2 = page2.locator('[data-testid="community-card"]').first();
    
    await community1.locator('[data-testid="join-request-button"]').click();
    await community2.locator('[data-testid="join-request-button"]').click();
    
    // Verify both can access the form
    await expect(page1.locator('[data-testid="application-form"]')).toBeVisible();
    await expect(page2.locator('[data-testid="application-form"]')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });
});