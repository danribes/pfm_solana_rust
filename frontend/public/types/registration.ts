// Task 7.1.3: Public User Registration & Wallet Connection
// TypeScript definitions for registration and wallet connection system

// Core User Types
export interface UserRegistrationData {
  id?: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  interests: string[];
  referralCode?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  walletAddress?: string;
  walletProvider?: WalletProvider;
  profilePicture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  interests: string[];
  walletAddress: string;
  walletProvider: WalletProvider;
  profilePicture?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language: string;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  registrationDate: string;
  lastLoginDate: string;
  accountStatus: 'active' | 'pending' | 'suspended' | 'banned';
}

// Wallet Integration Types
export type WalletProvider = 
  | 'phantom'
  | 'solflare' 
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'ledger'
  | 'trezor';

export interface WalletInfo {
  provider: WalletProvider;
  name: string;
  icon: string;
  website: string;
  description: string;
  platforms: ('web' | 'mobile' | 'extension')[];
  installUrl: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    ios?: string;
    android?: string;
  };
  isInstalled: boolean;
  isDetected: boolean;
}

export interface WalletConnection {
  provider: WalletProvider;
  address: string;
  publicKey: string;
  isConnected: boolean;
  balance?: number;
  chainId?: string;
  network?: string;
}

export interface WalletConnectionResult {
  success: boolean;
  connection?: WalletConnection;
  error?: string;
  requiresSignature?: boolean;
  signatureMessage?: string;
}

// Registration Flow Types
export type RegistrationStep = 
  | 'entry'
  | 'wallet-selection'
  | 'wallet-connection'
  | 'user-info'
  | 'interests'
  | 'terms'
  | 'email-verification'
  | 'complete';

export interface RegistrationState {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  userData: Partial<UserRegistrationData>;
  walletConnection?: WalletConnection;
  errors: Record<string, string>;
  isLoading: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  progress: number; // 0-100
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  asyncValidation?: (value: any) => Promise<boolean | string>;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'tel';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation: ValidationRule;
  helpText?: string;
  icon?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState {
  values: Record<string, any>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Email Verification Types
export interface EmailVerificationRequest {
  email: string;
  verificationUrl?: string;
  resend?: boolean;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  expiresAt?: string;
}

export interface EmailVerificationStatus {
  isVerified: boolean;
  isPending: boolean;
  canResend: boolean;
  nextResendAt?: string;
  attemptsRemaining?: number;
}

// Interest Categories
export interface InterestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'governance',
    name: 'Governance & Politics',
    description: 'Democratic processes, voting, policy making',
    icon: 'Vote',
    color: 'blue',
    subcategories: ['Local Government', 'Policy Making', 'Civic Engagement', 'Electoral Systems']
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Blockchain, web development, innovation',
    icon: 'Code',
    color: 'purple',
    subcategories: ['Blockchain', 'Web Development', 'AI/ML', 'Cybersecurity']
  },
  {
    id: 'environment',
    name: 'Environment',
    description: 'Sustainability, climate action, conservation',
    icon: 'Leaf',
    color: 'green',
    subcategories: ['Climate Change', 'Renewable Energy', 'Conservation', 'Sustainable Living']
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning, teaching, academic research',
    icon: 'BookOpen',
    color: 'orange',
    subcategories: ['Online Learning', 'Educational Policy', 'Research', 'Skills Development']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical research, public health, wellness',
    icon: 'Heart',
    color: 'red',
    subcategories: ['Public Health', 'Medical Research', 'Mental Health', 'Healthcare Policy']
  },
  {
    id: 'finance',
    name: 'Finance & Economics',
    description: 'DeFi, economics, financial systems',
    icon: 'DollarSign',
    color: 'yellow',
    subcategories: ['DeFi', 'Traditional Finance', 'Economics', 'Investment']
  },
  {
    id: 'social',
    name: 'Social Impact',
    description: 'Community building, social justice, philanthropy',
    icon: 'Users',
    color: 'pink',
    subcategories: ['Community Building', 'Social Justice', 'Philanthropy', 'Human Rights']
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    description: 'Creative expression, cultural preservation',
    icon: 'Palette',
    color: 'indigo',
    subcategories: ['Visual Arts', 'Music', 'Literature', 'Cultural Heritage']
  }
];

// API Response Types
export interface RegistrationResponse {
  success: boolean;
  data?: {
    userId: string;
    registrationToken: string;
    requiresEmailVerification: boolean;
  };
  error?: string;
  validationErrors?: FormErrors;
}

export interface UsernameCheckResponse {
  success: boolean;
  available: boolean;
  suggestions?: string[];
  message?: string;
}

export interface WalletSignatureRequest {
  message: string;
  nonce: string;
  expiresAt: string;
}

export interface WalletVerificationResponse {
  success: boolean;
  verified: boolean;
  walletAddress?: string;
  error?: string;
}

// Component Props Types
export interface RegistrationFlowProps {
  initialStep?: RegistrationStep;
  onComplete?: (userData: UserRegistrationData) => void;
  onCancel?: () => void;
  showProgress?: boolean;
  allowSkipSteps?: boolean;
}

export interface WalletSelectorProps {
  selectedProvider?: WalletProvider;
  onProviderSelect: (provider: WalletProvider) => void;
  onConnect: (provider: WalletProvider) => Promise<WalletConnectionResult>;
  showInstallGuide?: boolean;
  enableMobile?: boolean;
}

export interface UserInfoFormProps {
  initialData?: Partial<UserRegistrationData>;
  onSubmit: (data: Partial<UserRegistrationData>) => void;
  onBack?: () => void;
  isLoading?: boolean;
  errors?: FormErrors;
}

export interface EmailVerificationProps {
  email: string;
  onVerified: (token: string) => void;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  status: EmailVerificationStatus;
}

export interface TermsAcceptanceProps {
  onAccept: (accepted: { terms: boolean; privacy: boolean; marketing: boolean }) => void;
  onBack?: () => void;
  termsUrl: string;
  privacyUrl: string;
  loading?: boolean;
}

// Hook Types
export interface UseRegistrationResult {
  state: RegistrationState;
  actions: {
    setCurrentStep: (step: RegistrationStep) => void;
    updateUserData: (data: Partial<UserRegistrationData>) => void;
    setWalletConnection: (connection: WalletConnection) => void;
    setError: (field: string, error: string) => void;
    clearErrors: () => void;
    goNext: () => void;
    goBack: () => void;
    reset: () => void;
    submitRegistration: () => Promise<RegistrationResponse>;
  };
  validation: {
    validateStep: (step: RegistrationStep) => boolean;
    validateField: (field: string, value: any) => string | undefined;
    isStepComplete: (step: RegistrationStep) => boolean;
  };
}

export interface UseWalletConnectionResult {
  wallets: WalletInfo[];
  selectedWallet?: WalletProvider;
  connection?: WalletConnection;
  isConnecting: boolean;
  error?: string;
  actions: {
    selectWallet: (provider: WalletProvider) => void;
    connect: (provider: WalletProvider) => Promise<WalletConnectionResult>;
    disconnect: () => void;
    switchWallet: (provider: WalletProvider) => Promise<WalletConnectionResult>;
    verifyWallet: (signature: string) => Promise<WalletVerificationResponse>;
  };
}

export interface UseEmailVerificationResult {
  status: EmailVerificationStatus;
  actions: {
    sendVerificationEmail: (email: string) => Promise<EmailVerificationResponse>;
    verifyEmail: (token: string) => Promise<boolean>;
    resendVerification: () => Promise<EmailVerificationResponse>;
    checkVerificationStatus: (email: string) => Promise<EmailVerificationStatus>;
  };
}

// Security and Privacy Types
export interface PrivacySettings {
  allowAnalytics: boolean;
  allowMarketing: boolean;
  allowCommunityRecommendations: boolean;
  profileVisibility: 'public' | 'members' | 'private';
  emailNotifications: boolean;
  dataRetention: '1year' | '3years' | '5years' | 'indefinite';
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  recoveryEmailSet: boolean;
  walletBackupConfirmed: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

// Registration Analytics Types
export interface RegistrationAnalytics {
  stepStartTime: Record<RegistrationStep, number>;
  stepCompletionTime: Record<RegistrationStep, number>;
  walletConnectionAttempts: number;
  formValidationErrors: string[];
  abandonmentStep?: RegistrationStep;
  referralSource?: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// Error Types
export interface RegistrationError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
  retryable: boolean;
}

export const REGISTRATION_ERROR_CODES = {
  INVALID_EMAIL: 'INVALID_EMAIL',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  WALLET_NOT_DETECTED: 'WALLET_NOT_DETECTED',
  SIGNATURE_REJECTED: 'SIGNATURE_REJECTED',
  EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',
  TERMS_NOT_ACCEPTED: 'TERMS_NOT_ACCEPTED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMITED: 'RATE_LIMITED'
} as const;

// Configuration Types
export interface RegistrationConfig {
  enableWalletConnection: boolean;
  requireEmailVerification: boolean;
  enableSocialLogin: boolean;
  supportedWallets: WalletProvider[];
  passwordRequirements: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  usernameRequirements: {
    minLength: number;
    maxLength: number;
    allowedChars: RegExp;
    reservedNames: string[];
  };
  emailVerificationTimeout: number; // minutes
  maxResendAttempts: number;
  enableReferralSystem: boolean;
  termsVersion: string;
  privacyPolicyVersion: string;
}

export const DEFAULT_REGISTRATION_CONFIG: RegistrationConfig = {
  enableWalletConnection: true,
  requireEmailVerification: true,
  enableSocialLogin: false,
  supportedWallets: ['phantom', 'solflare', 'metamask', 'walletconnect'],
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  usernameRequirements: {
    minLength: 3,
    maxLength: 20,
    allowedChars: /^[a-zA-Z0-9_-]+$/,
    reservedNames: ['admin', 'root', 'api', 'www', 'support', 'help']
  },
  emailVerificationTimeout: 15,
  maxResendAttempts: 3,
  enableReferralSystem: true,
  termsVersion: '1.0',
  privacyPolicyVersion: '1.0'
}; 