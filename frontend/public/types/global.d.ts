// Task 7.1.1: Public Landing Page Development
// Global type declarations for analytics and window extensions

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
    _linkedin_partner_id: string;
    _linkedin_data_partner_ids: string[];
  }
}

export {};
