// Security Types for Account Security & Recovery Forms
// TypeScript definitions for authentication, 2FA, and security management

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  trustedDevices: TrustedDevice[];
  sessionTimeout: number; // minutes
  loginNotifications: boolean;
  ipWhitelist: string[];
  lastPasswordChange: string;
  securityQuestions: SecurityQuestion[];
  passwordStrength: PasswordStrength;
  accountLockout: AccountLockoutSettings;
}

export type TwoFactorMethod = 'none' | 'totp' | 'sms' | 'email' | 'hardware';

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string; // This will be hashed on the server
  createdAt: string;
  lastUsed?: string;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  requirement: string;
  met: boolean;
  description: string;
}

export interface AccountLockoutSettings {
  maxAttempts: number;
  lockoutDuration: number; // minutes
  resetOnSuccess: boolean;
  notifyOnLockout: boolean;
}

// Password Reset Types
export interface PasswordResetRequest {
  email?: string;
  username?: string;
  walletAddress?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  expiresAt?: string;
  requiresSecurityQuestions?: boolean;
  securityQuestions?: SecurityQuestion[];
}

export interface PasswordResetConfirmation {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
  securityAnswers?: { [questionId: string]: string };
}

// Two-Factor Authentication Types
export interface TwoFactorSetup {
  method: TwoFactorMethod;
  secret?: string; // For TOTP
  qrCode?: string; // Base64 encoded QR code
  backupCodes?: string[];
  phoneNumber?: string; // For SMS
  email?: string; // For email-based 2FA
}

export interface TwoFactorVerification {
  code: string;
  method: TwoFactorMethod;
  rememberDevice: boolean;
  deviceName?: string;
}

export interface TwoFactorBackupCode {
  code: string;
  used: boolean;
  usedAt?: string;
}

// Account Recovery Types
export interface AccountRecoveryRequest {
  identifier: string; // email, username, or wallet address
  recoveryMethod: RecoveryMethod;
}

export type RecoveryMethod = 'email' | 'security_questions' | 'wallet_signature' | 'support_ticket';

export interface AccountRecoveryResponse {
  success: boolean;
  recoveryId: string;
  method: RecoveryMethod;
  steps: RecoveryStep[];
  expiresAt: string;
  contactInfo?: string; // Masked email or phone
}

export interface RecoveryStep {
  id: string;
  type: 'email_verification' | 'security_questions' | 'wallet_signature' | 'identity_verification';
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  data?: any; // Step-specific data
}

export interface AccountRecoveryVerification {
  recoveryId: string;
  stepId: string;
  verification: {
    emailCode?: string;
    securityAnswers?: { [questionId: string]: string };
    walletSignature?: string;
    identityDocument?: File;
  };
}

// Security Audit Types
export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: SecurityAction;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  wasBlocked: boolean;
}

export type SecurityAction = 
  | 'login_success'
  | 'login_failed'
  | 'password_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'device_added'
  | 'device_removed'
  | 'security_settings_updated'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity_detected'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'account_recovery_initiated'
  | 'account_recovery_completed';

// Form-specific types
export interface PasswordResetFormData {
  email: string;
  captcha?: string;
}

export interface PasswordResetConfirmFormData {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
  securityAnswers?: { [questionId: string]: string };
}

export interface SecuritySettingsFormData {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  sessionTimeout: number;
  loginNotifications: boolean;
  trustedDevicesEnabled: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  securityQuestions: SecurityQuestion[];
}

export interface TwoFactorSetupFormData {
  method: TwoFactorMethod;
  phoneNumber?: string;
  email?: string;
  verificationCode: string;
  backupCodes?: string[];
  deviceName?: string;
}

export interface AccountRecoveryFormData {
  identifier: string;
  recoveryMethod: RecoveryMethod;
  verificationData?: {
    emailCode?: string;
    securityAnswers?: { [questionId: string]: string };
    walletSignature?: string;
  };
}

// Validation types
export interface SecurityValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SecurityFormErrors {
  [key: string]: string | undefined;
}

// API Response types
export interface SecurityApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: SecurityValidationError[];
}

// Constants
export const SECURITY_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_TIMEOUT_MIN: 15, // minutes
  SESSION_TIMEOUT_MAX: 1440, // 24 hours
  MAX_TRUSTED_DEVICES: 10,
  MAX_SECURITY_QUESTIONS: 5,
  BACKUP_CODES_COUNT: 10,
  PASSWORD_RESET_EXPIRY: 60, // minutes
  ACCOUNT_RECOVERY_EXPIRY: 24, // hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30, // minutes
} as const;

export const PREDEFINED_SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your first car's make and model?",
  "What was the name of your elementary school?",
  "What was your mother's maiden name?",
  "What was the street name you lived on in third grade?",
  "What is your oldest sibling's middle name?",
  "What was the first concert you attended?",
  "What was the name of your first employer?",
  "What is your favorite book?",
] as const;

export const TWO_FACTOR_METHODS = [
  { value: 'none', label: 'Disabled', description: 'Two-factor authentication is disabled' },
  { value: 'totp', label: 'Authenticator App', description: 'Use Google Authenticator, Authy, or similar apps' },
  { value: 'sms', label: 'SMS', description: 'Receive codes via text message' },
  { value: 'email', label: 'Email', description: 'Receive codes via email' },
  { value: 'hardware', label: 'Hardware Key', description: 'Use YubiKey or similar hardware tokens' },
] as const;

export const RECOVERY_METHODS = [
  { value: 'email', label: 'Email Recovery', description: 'Reset via email verification' },
  { value: 'security_questions', label: 'Security Questions', description: 'Answer your security questions' },
  { value: 'wallet_signature', label: 'Wallet Signature', description: 'Sign a message with your wallet' },
  { value: 'support_ticket', label: 'Contact Support', description: 'Submit a support ticket for manual recovery' },
] as const; 