// Task 7.1.1: Public Landing Page Development
// Type definitions for landing page components

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
  showVideo?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  benefits: string[];
  ctaText?: string;
  ctaHref?: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  userType: 'community-admin' | 'member' | 'organization' | 'all';
  highlight: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  content: string;
  avatar: string;
  rating: number;
  verified: boolean;
}

export interface StatsItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'security' | 'technical' | 'pricing' | 'blockchain';
  popular: boolean;
}

export interface HowItWorksStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  details: string[];
}

export interface CTASection {
  id: string;
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
  };
  secondaryButton?: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
  };
  backgroundColor?: string;
  pattern?: 'gradient' | 'dots' | 'waves' | 'none';
}

export interface DemoPreviewProps {
  type: 'voting' | 'dashboard' | 'community' | 'results';
  interactive: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
}

export interface CommunityExample {
  id: string;
  name: string;
  type: 'dao' | 'organization' | 'cooperative' | 'nonprofit';
  memberCount: number;
  totalVotes: number;
  description: string;
  logo: string;
  tags: string[];
  featured: boolean;
}

export interface EmailSignupData {
  email: string;
  firstName?: string;
  lastName?: string;
  organizationType?: 'dao' | 'organization' | 'cooperative' | 'nonprofit' | 'other';
  interests?: string[];
  source?: string;
}

export interface QuickRegisterData extends EmailSignupData {
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

export interface ConversionEvent {
  type: 'page_view' | 'cta_click' | 'form_submit' | 'video_play' | 'demo_interaction';
  source: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  linkedInInsightTag?: string;
  customEvents: boolean;
  trackScrollDepth: boolean;
  trackTimeOnPage: boolean;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export interface SocialShareData {
  url: string;
  title: string;
  description: string;
  hashtags?: string[];
  via?: string;
}

export interface LandingPageConfig {
  hero: HeroSectionProps;
  features: FeatureItem[];
  benefits: BenefitItem[];
  testimonials: TestimonialItem[];
  stats: StatsItem[];
  faqs: FAQItem[];
  howItWorks: HowItWorksStep[];
  ctaSections: CTASection[];
  communityExamples: CommunityExample[];
  seo: SEOMetadata;
  analytics: AnalyticsConfig;
}

export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  technicalDetails: string[];
  certifications?: string[];
  auditReports?: string[];
}

export interface ComparisonItem {
  feature: string;
  traditional: string | boolean;
  blockchain: string | boolean;
  advantage: 'high' | 'medium' | 'low';
}

export interface PlatformMetrics {
  totalCommunities: number;
  totalVotes: number;
  totalMembers: number;
  uptime: number;
  securityScore: number;
  lastUpdated: string;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation: ValidationRule;
  helpText?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Animation and interaction types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  repeat?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface IntersectionConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NewsletterSubscription {
  email: string;
  subscribed: boolean;
  source: string;
  timestamp: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  message: string;
  type: 'general' | 'sales' | 'support' | 'partnership';
}

// Component state types
export interface ComponentState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  size: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
