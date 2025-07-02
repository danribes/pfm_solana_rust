// Task 7.1.3: Public User Registration & Wallet Connection
// Email verification service for registration system

import {
  EmailVerificationRequest,
  EmailVerificationResponse,
  EmailVerificationStatus,
  REGISTRATION_ERROR_CODES
} from '@/types/registration';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Email verification API client
class EmailVerificationService {
  private baseURL: string;
  private timeout: number;
  private verificationAttempts: Map<string, number> = new Map();
  private lastSendTime: Map<string, number> = new Map();

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Send email verification
  async sendVerificationEmail(request: EmailVerificationRequest): Promise<EmailVerificationResponse> {
    const { email, verificationUrl, resend = false } = request;
    
    // Check rate limiting
    if (!resend && this.isRateLimited(email)) {
      throw new Error('Please wait before requesting another verification email');
    }

    const url = `${this.baseURL}/api/auth/send-verification`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          email,
          verificationUrl,
          resend
        }),
      });

      const result = await this.handleResponse<EmailVerificationResponse>(response);
      
      // Track send time for rate limiting
      this.lastSendTime.set(email, Date.now());
      
      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<boolean> {
    const url = `${this.baseURL}/api/auth/verify-email`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      const result = await this.handleResponse<{ success: boolean; verified: boolean }>(response);
      return result.verified;
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  }

  // Check verification status
  async checkVerificationStatus(email: string): Promise<EmailVerificationStatus> {
    const url = `${this.baseURL}/api/auth/verification-status`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return await this.handleResponse<EmailVerificationStatus>(response);
    } catch (error) {
      console.error('Failed to check verification status:', error);
      
      // Return default status on error
      return {
        isVerified: false,
        isPending: false,
        canResend: true
      };
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<EmailVerificationResponse> {
    // Check if user can resend
    const status = await this.checkVerificationStatus(email);
    if (!status.canResend) {
      throw new Error('Cannot resend verification email at this time');
    }

    // Increment attempt count
    const attempts = this.verificationAttempts.get(email) || 0;
    this.verificationAttempts.set(email, attempts + 1);

    return this.sendVerificationEmail({
      email,
      resend: true
    });
  }

  // Cancel pending verification
  async cancelVerification(email: string): Promise<void> {
    const url = `${this.baseURL}/api/auth/cancel-verification`;
    
    try {
      await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      // Clear local tracking
      this.verificationAttempts.delete(email);
      this.lastSendTime.delete(email);
    } catch (error) {
      console.error('Failed to cancel verification:', error);
      throw error;
    }
  }

  // Rate limiting check
  private isRateLimited(email: string): boolean {
    const lastSent = this.lastSendTime.get(email);
    if (!lastSent) return false;
    
    const timeSinceLastSend = Date.now() - lastSent;
    const minInterval = 60 * 1000; // 1 minute minimum between sends
    
    return timeSinceLastSend < minInterval;
  }

  // Get remaining wait time for resend
  getRemainingWaitTime(email: string): number {
    const lastSent = this.lastSendTime.get(email);
    if (!lastSent) return 0;
    
    const timeSinceLastSend = Date.now() - lastSent;
    const minInterval = 60 * 1000; // 1 minute
    
    return Math.max(0, minInterval - timeSinceLastSend);
  }

  // Get attempt count
  getAttemptCount(email: string): number {
    return this.verificationAttempts.get(email) || 0;
  }

  // Clear tracking data
  clearTrackingData(email: string): void {
    this.verificationAttempts.delete(email);
    this.lastSendTime.delete(email);
  }
}

// Create singleton instance
const emailVerificationService = new EmailVerificationService();

// Export main functions
export const sendVerificationEmail = (request: EmailVerificationRequest) =>
  emailVerificationService.sendVerificationEmail(request);

export const verifyEmail = (token: string) =>
  emailVerificationService.verifyEmail(token);

export const checkVerificationStatus = (email: string) =>
  emailVerificationService.checkVerificationStatus(email);

export const resendVerificationEmail = (email: string) =>
  emailVerificationService.resendVerificationEmail(email);

export const cancelVerification = (email: string) =>
  emailVerificationService.cancelVerification(email);

export const getRemainingWaitTime = (email: string) =>
  emailVerificationService.getRemainingWaitTime(email);

export const getAttemptCount = (email: string) =>
  emailVerificationService.getAttemptCount(email);

export const clearTrackingData = (email: string) =>
  emailVerificationService.clearTrackingData(email);

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Mock functions for development
export const mockSendVerificationEmail = async (
  request: EmailVerificationRequest
): Promise<EmailVerificationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { email } = request;
  
  // Simulate different scenarios based on email
  if (email.includes('invalid')) {
    throw new Error('Invalid email address');
  }
  
  if (email.includes('blocked')) {
    throw new Error('This email domain is not allowed');
  }

  return {
    success: true,
    message: 'Verification email sent successfully',
    token: `mock-token-${Math.random().toString(36).substr(2, 20)}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
  };
};

export const mockVerifyEmail = async (token: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock verification scenarios
  if (token.includes('invalid')) {
    throw new Error('Invalid verification token');
  }
  
  if (token.includes('expired')) {
    throw new Error('Verification token has expired');
  }
  
  // Always succeed for mock tokens
  return token.startsWith('mock-token-');
};

export const mockCheckVerificationStatus = async (email: string): Promise<EmailVerificationStatus> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock different statuses based on email
  if (email.includes('verified')) {
    return {
      isVerified: true,
      isPending: false,
      canResend: false
    };
  }
  
  if (email.includes('pending')) {
    return {
      isVerified: false,
      isPending: true,
      canResend: true,
      nextResendAt: new Date(Date.now() + 30 * 1000).toISOString(), // 30 seconds
      attemptsRemaining: 2
    };
  }
  
  // Default unverified status
  return {
    isVerified: false,
    isPending: false,
    canResend: true,
    attemptsRemaining: 3
  };
};

// Utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmailDomain = (email: string): string => {
  return email.split('@')[1] || '';
};

export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.org',
    'throwaway.email',
    'mailinator.com',
    'temp-mail.org',
    'getnada.com'
  ];
  
  const domain = getEmailDomain(email).toLowerCase();
  return disposableDomains.includes(domain);
};

export const formatEmailForDisplay = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  if (local.length <= 3) {
    return `${local}***@${domain}`;
  }
  
  const visibleChars = Math.min(3, Math.floor(local.length / 2));
  const hiddenPart = '*'.repeat(local.length - visibleChars);
  
  return `${local.substring(0, visibleChars)}${hiddenPart}@${domain}`;
};

// Email template helpers
export const generateVerificationEmailTemplate = (
  username: string,
  verificationUrl: string,
  expirationMinutes: number = 15
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verify Your Email - PFM Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; }
            .button { display: inline-block; background: #2563eb; color: white; 
                     padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                     margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PFM Platform</div>
            </div>
            <div class="content">
                <h2>Welcome to PFM Platform, ${username}!</h2>
                <p>Thank you for creating an account. To get started, please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                <p>This link will expire in ${expirationMinutes} minutes for security reasons.</p>
                <p>If you didn't create an account with PFM Platform, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2024 PFM Platform. All rights reserved.</p>
                <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
                <p>${verificationUrl}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Email verification analytics
export const trackEmailVerificationEvent = (
  eventType: 'sent' | 'opened' | 'clicked' | 'verified' | 'expired' | 'resent',
  email: string,
  metadata?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_verification', {
      event_category: 'registration',
      event_label: eventType,
      custom_map: {
        email_domain: getEmailDomain(email),
        ...metadata
      }
    });
  }
  
  // Also track in console for development
  if (isDevelopment) {
    console.log('Email Verification Event:', {
      type: eventType,
      email: formatEmailForDisplay(email),
      metadata,
      timestamp: new Date().toISOString()
    });
  }
};

// Error handling
export const handleEmailVerificationError = (error: any): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown error occurred during email verification');
};

// Export service instance
export default emailVerificationService; 