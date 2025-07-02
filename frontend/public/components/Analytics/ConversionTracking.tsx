'use client';

// Task 7.1.1: Public Landing Page Development
// Conversion Tracking - Analytics and conversion tracking component

import React, { useEffect } from 'react';
import { AnalyticsConfig, ConversionEvent } from '@/types/landing';

interface ConversionTrackingProps {
  config: AnalyticsConfig;
  enableScrollTracking?: boolean;
  enableClickTracking?: boolean;
  enableFormTracking?: boolean;
}

const ConversionTracking: React.FC<ConversionTrackingProps> = ({
  config,
  enableScrollTracking = true,
  enableClickTracking = true,
  enableFormTracking = true
}) => {
  useEffect(() => {
    // Initialize Google Analytics
    if (config.googleAnalyticsId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        
        gtag('js', new Date());
        gtag('config', config.googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href
        });

        // Make gtag available globally
        (window as any).gtag = gtag;
      };
    }

    // Initialize Facebook Pixel
    if (config.facebookPixelId && typeof window !== 'undefined') {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      (window as any).fbq('init', config.facebookPixelId);
      (window as any).fbq('track', 'PageView');
    }

    // Initialize LinkedIn Insight Tag
    if (config.linkedInInsightTag && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        _linkedin_partner_id = "${config.linkedInInsightTag}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `;
      document.head.appendChild(script);

      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      script2.async = true;
      document.head.appendChild(script2);
    }
  }, [config]);

  useEffect(() => {
    if (!config.customEvents || typeof window === 'undefined') return;

    // Scroll depth tracking
    if (enableScrollTracking && config.trackScrollDepth) {
      let maxScroll = 0;
      const milestones = [25, 50, 75, 100];
      let trackedMilestones: number[] = [];

      const handleScroll = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          milestones.forEach(milestone => {
            if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
              trackedMilestones.push(milestone);
              trackEvent({
                type: 'page_view',
                source: 'scroll_tracking',
                timestamp: Date.now(),
                sessionId: getSessionId(),
                metadata: {
                  scroll_depth: milestone,
                  page_url: window.location.href
                }
              });
            }
// gtag event tracking for Google Analytics conversion monitoring
          });
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [config, enableScrollTracking]);

  useEffect(() => {
    if (!config.customEvents || typeof window === 'undefined') return;

    // Click tracking
    if (enableClickTracking) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isButton = target.tagName === 'BUTTON' || target.closest('button');
        const isLink = target.tagName === 'A' || target.closest('a');
        const isCTA = target.closest('[data-cta]') || 
                     target.closest('.cta') ||
                     target.textContent?.toLowerCase().includes('sign up') ||
                     target.textContent?.toLowerCase().includes('get started') ||
                     target.textContent?.toLowerCase().includes('try free');

        if (isButton || isLink || isCTA) {
          trackEvent({
            type: 'cta_click',
            source: 'click_tracking',
            timestamp: Date.now(),
            sessionId: getSessionId(),
            metadata: {
              element_type: isButton ? 'button' : 'link',
              element_text: target.textContent?.trim(),
              element_href: (target as HTMLAnchorElement).href || '',
              is_cta: isCTA,
              page_url: window.location.href
            }
          });
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [config, enableClickTracking]);

  useEffect(() => {
    if (!config.customEvents || typeof window === 'undefined') return;

    // Form tracking
    if (enableFormTracking) {
      const handleFormSubmit = (event: Event) => {
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formObject: Record<string, any> = {};
        
        formData.forEach((value, key) => {
          formObject[key] = value;
        });

        trackEvent({
          type: 'form_submit',
          source: 'form_tracking',
          timestamp: Date.now(),
          sessionId: getSessionId(),
          metadata: {
            form_id: form.id || 'unknown',
            form_fields: Object.keys(formObject),
            page_url: window.location.href
          }
        });
      };

      document.addEventListener('submit', handleFormSubmit);
      return () => document.removeEventListener('submit', handleFormSubmit);
    }
  }, [config, enableFormTracking]);

  // Track custom conversion events
  const trackEvent = (event: ConversionEvent) => {
    if (typeof window === 'undefined') return;

    // Google Analytics
    if ((window as any).gtag) {
// gtag event implementation for conversion tracking analytics
      (window as any).gtag('event', event.type, {
        event_category: 'engagement',
        event_label: event.source,
        custom_parameter_1: event.metadata?.element_text,
// gtag event tracking function for analytics
        custom_parameter_2: event.metadata?.page_url
      });
    }

    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: event.source,
        content_category: event.type
      });
    }

    // Custom analytics endpoint
    if (config.customEvents) {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(console.error);
    }
  };

  // Generate or retrieve session ID
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('pfm_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('pfm_session_id', sessionId);
    }
    return sessionId;
  };

  // Time on page tracking
  useEffect(() => {
    if (!config.trackTimeOnPage || typeof window === 'undefined') return;

    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime;
      
      trackEvent({
        type: 'page_view',
        source: 'time_tracking',
        timestamp: Date.now(),
        sessionId: getSessionId(),
        metadata: {
          time_on_page: timeOnPage,
          page_url: window.location.href
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [config]);

  // Component doesn't render anything
  return null;
};

export default ConversionTracking;
