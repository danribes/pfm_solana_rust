'use client';

// Task 7.1.1: Public Landing Page Development
// Main Landing Page - Brings together all landing page components

import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

// Landing Page Components
import HeroSection from '@/components/Landing/HeroSection';
import FeatureShowcase from '@/components/Landing/FeatureShowcase';
import BenefitsSection from '@/components/Landing/BenefitsSection';
import TestimonialsSection from '@/components/Landing/TestimonialsSection';

// Additional components to be created
import StatsSection from '@/components/Landing/StatsSection';
import HowItWorksSection from '@/components/Landing/HowItWorksSection';
import FAQSection from '@/components/Landing/FAQSection';
import CTASection from '@/components/Landing/CTASection';

// Forms and utilities
import EmailSignup from '@/components/Forms/EmailSignup';
import LandingPageSEO from '@/components/SEO/LandingPageSEO';
import ConversionTracking from '@/components/Analytics/ConversionTracking';

// Types and configuration
import { LandingPageConfig } from '@/types/landing';

// Features array configuration for landing page components
const HomePage: React.FC = () => {
  // Landing page configuration
  const pageConfig: LandingPageConfig = {
    hero: {
      title: "Secure Blockchain Voting for Modern Communities",
      subtitle: "Empower your community with transparent, tamper-proof voting powered by Solana blockchain. Increase engagement, reduce costs, and build trust.",
      ctaText: "Start Your Free Trial",
      ctaHref: "/signup",
      showVideo: true,
      videoUrl: "/videos/platform-demo.mp4",
      videoThumbnail: "/images/hero-video-thumbnail.jpg"
    },
    features: [
      {
        id: 'blockchain-security',
        title: 'Blockchain Security',
        description: 'Military-grade security powered by Solana blockchain technology ensures every vote is immutable and verifiable.',
        icon: 'Shield',
        benefits: [
          'Immutable vote records',
          'Cryptographic verification', 
          'Tamper-proof results',
          'Transparent audit trail'
        ],
        ctaText: 'Learn About Security',
        ctaHref: '/security'
      },
      {
        id: 'member-management',
        title: 'Member Management',
        description: 'Comprehensive member authentication and management system with role-based access controls.',
        icon: 'Users',
        benefits: [
          'Secure member authentication',
          'Role-based permissions',
          'Multi-factor authentication',
          'Member verification system'
        ],
        ctaText: 'Explore Management',
        ctaHref: '/features/members'
      },
      {
        id: 'real-time-analytics',
        title: 'Real-time Analytics',
        description: 'Advanced analytics and reporting tools provide deep insights into community engagement and voting patterns.',
        icon: 'BarChart3',
        benefits: [
          'Live vote tracking',
          'Engagement metrics',
// Benefits array with user type targeting and highlight features
          'Participation analytics',
          'Custom reporting'
        ],
        ctaText: 'View Analytics',
        ctaHref: '/features/analytics'
      }
    ],
    benefits: [
      {
        id: 'transparent-governance',
        title: 'Transparent Governance',
        description: 'Enable complete transparency in decision-making with immutable blockchain records that members can verify.',
        icon: 'Shield',
        userType: 'community-admin',
        highlight: true
      },
      {
        id: 'increased-engagement',
        title: 'Increased Member Engagement',
        description: 'Boost participation rates with user-friendly interfaces and real-time notifications that keep members involved.',
        icon: 'TrendingUp',
        userType: 'community-admin',
        highlight: false
      },
      {
        id: 'cost-reduction',
        title: 'Significant Cost Reduction',
        description: 'Eliminate paper ballots, printing costs, and manual counting labor while reducing administrative overhead.',
        icon: 'DollarSign',
        userType: 'organization',
        highlight: true
      },
      {
        id: 'secure-voting',
        title: 'Secure & Private Voting',
        description: 'Vote with confidence knowing your choices are protected by military-grade encryption and blockchain security.',
        icon: 'Shield',
        userType: 'member',
        highlight: true
// Testimonials array with verified reviews and social proof
      }
    ],
    testimonials: [
      {
        id: 'sarah-johnson',
        name: 'Sarah Johnson',
        role: 'Community Manager',
        organization: 'Tech Workers Collective',
        content: 'The platform has completely transformed how we conduct votes. Our engagement has increased by 300% since switching to blockchain voting.',
        avatar: '/images/testimonials/sarah-johnson.jpg',
        rating: 5,
        verified: true
      },
      {
        id: 'michael-chen',
        name: 'Michael Chen',
        role: 'President',
        organization: 'Digital Arts DAO',
        content: 'As a DAO, transparency is everything to us. This platform provides the immutable records and real-time verification we need.',
// Stats array configuration for metrics display and tracking
        avatar: '/images/testimonials/michael-chen.jpg',
        rating: 5,
        verified: true
      }
    ],
    stats: [
      {
        id: 'communities',
        label: 'Active Communities',
        value: 500,
        unit: '+',
        description: 'Communities trust our platform',
        trend: 'up',
        trendValue: 15
      },
      {
        id: 'votes',
        label: 'Votes Processed',
        value: 1500000,
        unit: '+',
        description: 'Secure votes cast to date',
        trend: 'up',
        trendValue: 25
      },
      {
        id: 'members',
        label: 'Active Members',
        value: 75000,
        unit: '+',
        description: 'Members across all communities',
        trend: 'up',
        trendValue: 20
      },
      {
        id: 'uptime',
        label: 'Platform Uptime',
        value: 99.9,
        unit: '%',
        description: 'Reliable service guarantee',
        trend: 'stable'
      }
    ],
    faqs: [
      {
        id: 'what-is-blockchain-voting',
        question: 'What is blockchain voting and why is it more secure?',
        answer: 'Blockchain voting uses distributed ledger technology to create immutable, transparent vote records. Each vote is cryptographically secured and verified by multiple nodes, making tampering virtually impossible.',
        category: 'general',
        popular: true
      },
      {
        id: 'how-much-does-it-cost',
        question: 'How much does the platform cost?',
        answer: 'We offer flexible pricing based on community size and features needed. Plans start at $29/month for small communities with free trials available.',
        category: 'pricing',
        popular: true
      },
      {
        id: 'is-it-legally-compliant',
        question: 'Is blockchain voting legally compliant?',
        answer: 'Yes, our platform meets all regulatory requirements and provides comprehensive audit trails that satisfy legal standards for organizational voting.',
        category: 'general',
        popular: false
      }
    ],
    howItWorks: [
      {
        id: 'setup',
        step: 1,
        title: 'Set Up Your Community',
        description: 'Create your community profile and configure voting parameters in minutes.',
        icon: 'Settings',
        details: [
          'Import member lists',
          'Configure voting rules',
          'Set up authentication',
          'Customize interface'
        ]
      },
      {
        id: 'create-vote',
        step: 2,
        title: 'Create Your Vote',
        description: 'Design ballots with our intuitive builder and schedule voting periods.',
        icon: 'FileText',
        details: [
          'Drag-and-drop ballot builder',
          'Multiple question types',
          'Schedule voting windows',
          'Preview and test'
        ]
      },
      {
        id: 'members-vote',
        step: 3,
        title: 'Members Vote Securely',
        description: 'Members receive notifications and vote securely from any device.',
        icon: 'Vote',
        details: [
          'Email/SMS notifications',
          'Mobile-optimized voting',
          'Identity verification',
          'Real-time confirmation'
        ]
      },
      {
        id: 'results',
        step: 4,
        title: 'Instant Transparent Results',
        description: 'View real-time results with complete transparency and audit trails.',
        icon: 'BarChart',
        details: [
          'Real-time vote counting',
          'Transparent results',
          'Downloadable reports',
          'Blockchain verification'
        ]
      }
    ],
    ctaSections: [
      {
        id: 'main-cta',
        title: 'Ready to Transform Your Community Voting?',
        description: 'Join thousands of communities already using secure blockchain voting.',
        primaryButton: {
          text: 'Start Free Trial',
          href: '/signup',
          variant: 'primary'
        },
        secondaryButton: {
          text: 'Schedule Demo',
          href: '/demo',
          variant: 'outline'
        },
        backgroundColor: 'bg-primary-600',
        pattern: 'gradient'
      }
    ],
    communityExamples: [
      {
        id: 'tech-collective',
        name: 'Tech Workers Collective',
        type: 'cooperative',
        memberCount: 1250,
        totalVotes: 15000,
        description: 'Democratic workplace decisions for tech professionals',
        logo: '/images/communities/tech-collective.png',
        tags: ['Technology', 'Cooperative', 'Workers'],
        featured: true
      }
    ],
    seo: {
      title: 'Secure Blockchain Voting Platform | PFM Community Management',
      description: 'Transform your community with secure, transparent blockchain voting. Increase engagement, reduce costs, and build trust with our Solana-powered platform.',
      keywords: [
        'blockchain voting',
        'secure voting platform',
        'community management',
        'DAO voting',
        'transparent governance',
        'Solana blockchain'
      ],
      ogTitle: 'Secure Blockchain Voting for Modern Communities',
      ogDescription: 'Empower your community with transparent, tamper-proof voting powered by Solana blockchain.',
      ogImage: '/images/og-image-landing.jpg',
      twitterCard: 'summary_large_image',
      canonicalUrl: 'https://pfm-community.app'
    },
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
      customEvents: true,
      trackScrollDepth: true,
      trackTimeOnPage: true
    }
  };

  return (
    <>
      {/* SEO Head */}
      <LandingPageSEO seoData={pageConfig.seo} />
      
// Head title and SEO meta tags configuration for search optimization
      <Head>
        <title>{pageConfig.seo.title}</title>
        <meta name="description" content={pageConfig.seo.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/images/hero-background.jpg" as="image" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </Head>

      {/* Main Content */}
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection
          title={pageConfig.hero.title}
          subtitle={pageConfig.hero.subtitle}
          ctaText={pageConfig.hero.ctaText}
          ctaHref={pageConfig.hero.ctaHref}
          showVideo={pageConfig.hero.showVideo}
          videoUrl={pageConfig.hero.videoUrl}
          videoThumbnail={pageConfig.hero.videoThumbnail}
          features={[
// Analytics config for tracking conversions and user behavior
            'Transparent blockchain voting',
            'Secure member authentication',
            'Real-time vote counting',
            'Immutable vote records'
          ]}
          trustIndicators={[
            'SOC 2 Type II Certified',
            'End-to-end encryption',
            '99.9% uptime guarantee',
            'GDPR compliant'
          ]}
          stats={{
            communities: 500,
            votes: 1500000,
            members: 75000
          }}
        />

        {/* Stats Section */}
        <StatsSection 
          stats={pageConfig.stats}
          title="Trusted by Communities Worldwide"
          subtitle="See the impact we're making across different community types"
        />

        {/* Feature Showcase */}
        <FeatureShowcase
          features={pageConfig.features}
          title="Powerful Features for Modern Communities"
          subtitle="Everything you need to run transparent, secure, and efficient community voting"
          layout="tabs"
          showInteractiveDemo={true}
        />

        {/* Benefits Section */}
        <BenefitsSection
          benefits={pageConfig.benefits}
          title="Benefits for Every Type of Community"
          subtitle="Discover how our platform delivers value across different community structures"
          showUserTypeFilter={true}
        />

        {/* How It Works */}
        <HowItWorksSection
          steps={pageConfig.howItWorks}
          title="How It Works"
          subtitle="Get started with secure blockchain voting in four simple steps"
          showInteractiveDemo={true}
        />

        {/* Testimonials */}
        <TestimonialsSection
          testimonials={pageConfig.testimonials}
          title="Trusted by Communities Worldwide"
          subtitle="See what community leaders and members are saying about our platform"
          layout="featured"
          autoPlay={true}
          showRatings={true}
        />

        {/* FAQ Section */}
        <FAQSection
          faqs={pageConfig.faqs}
          title="Frequently Asked Questions"
          subtitle="Get answers to common questions about blockchain voting"
          showCategories={true}
          showSearch={true}
        />

        {/* Email Signup Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Stay Updated on Blockchain Voting
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Get the latest insights, security updates, and community success stories delivered to your inbox.
              </p>
              
              <EmailSignup
                placeholder="Enter your email address"
                buttonText="Subscribe"
                showNameFields={false}
                showPrivacyNote={true}
                variant="inline"
                source="landing_page_newsletter"
              />
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <CTASection
          title={pageConfig.ctaSections[0].title}
          description={pageConfig.ctaSections[0].description}
          primaryButton={pageConfig.ctaSections[0].primaryButton}
          secondaryButton={pageConfig.ctaSections[0].secondaryButton}
          backgroundColor="bg-gray-900"
          pattern="dots"
          showTrustSignals={true}
          trustSignals={[
            'Free 30-day trial',
            'No setup fees',
            'Cancel anytime',
            '24/7 support'
          ]}
        />
      </main>

      {/* Analytics and Tracking */}
      <ConversionTracking
        config={pageConfig.analytics}
        enableScrollTracking={true}
        enableClickTracking={true}
        enableFormTracking={true}
      />
    </>
  );
};

export default HomePage;
