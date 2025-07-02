'use client';

// Task 7.1.1: Public Landing Page Development
// Feature Showcase - Platform features display with interactive elements

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Lock, 
  Globe, 
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { FeatureItem } from '@/types/landing';
import { fadeInUp, staggerContainer, staggerItem, hoverAnimations } from '@/utils/animation';

interface FeatureShowcaseProps {
  features?: FeatureItem[];
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'tabs' | 'carousel';
  showInteractiveDemo?: boolean;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  features,
  title = "Powerful Features for Modern Communities",
  subtitle = "Everything you need to run transparent, secure, and efficient community voting",
  layout = 'tabs',
  showInteractiveDemo = true
}) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const defaultFeatures: FeatureItem[] = [
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
        'Participation analytics',
        'Custom reporting'
      ],
      ctaText: 'View Analytics',
      ctaHref: '/features/analytics'
    },
    {
      id: 'privacy-protection',
      title: 'Privacy Protection',
      description: 'Advanced privacy features ensure member confidentiality while maintaining vote transparency.',
      icon: 'Lock',
      benefits: [
        'Anonymous voting options',
        'Data encryption',
        'GDPR compliance',
        'Privacy by design'
      ],
      ctaText: 'Privacy Details',
      ctaHref: '/privacy'
    },
    {
      id: 'global-accessibility',
      title: 'Global Accessibility',
      description: 'Multi-language support and accessibility features ensure everyone can participate effectively.',
      icon: 'Globe',
      benefits: [
        'Multi-language interface',
        'Accessibility compliance',
        'Mobile optimization',
        'Cross-platform support'
      ],
      ctaText: 'Accessibility Info',
      ctaHref: '/accessibility'
    },
    {
      id: 'instant-results',
      title: 'Instant Results',
      description: 'Real-time vote counting and instant result publication with automated notifications.',
      icon: 'Zap',
      benefits: [
        'Instant vote counting',
        'Real-time updates',
        'Automated notifications',
        'Result visualization'
      ],
      ctaText: 'See Results Demo',
      ctaHref: '/demo/results'
    }
  ];

  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Shield: <Shield className="h-8 w-8" />,
      Users: <Users className="h-8 w-8" />,
      BarChart3: <BarChart3 className="h-8 w-8" />,
      Lock: <Lock className="h-8 w-8" />,
      Globe: <Globe className="h-8 w-8" />,
      Zap: <Zap className="h-8 w-8" />
    };
    return iconMap[iconName] || <Shield className="h-8 w-8" />;
  };

  const renderGridLayout = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {displayFeatures.map((feature, index) => (
        <motion.div
          key={feature.id}
          variants={staggerItem}
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-8 shadow-soft hover:shadow-strong transition-all duration-500 border border-gray-100 hover:border-primary-200 relative overflow-hidden"
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-50/20 to-primary-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
          
          {/* Animated icon container */}
          <motion.div
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
            }} 
            whileTap={{ scale: 0.95 }}
            className="relative w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              {getIconComponent(feature.icon)}
            </motion.div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </motion.div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-900 transition-colors">
              {feature.title}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors">
              {feature.description}
            </p>

            <div className="space-y-3 mb-6">
              {feature.benefits.map((benefit, benefitIndex) => (
                <motion.div 
                  key={benefitIndex} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: benefitIndex * 0.1 }}
                  className="flex items-center space-x-3 group/benefit"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover/benefit:text-green-600 transition-colors" />
                  </motion.div>
                  <span className="text-gray-700 text-sm font-medium group-hover/benefit:text-gray-800 transition-colors">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {feature.ctaText && feature.ctaHref && (
              <motion.a
                href={feature.ctaHref}
                whileHover={{ x: 5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-all duration-300 group/cta bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl"
              >
                {feature.ctaText}
                <ArrowRight className="ml-2 h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
              </motion.a>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary-100/50 to-purple-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-emerald-200/60 to-cyan-200/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderTabsLayout = () => (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left Column - Tab Navigation */}
      <div className="space-y-4">
        {displayFeatures.map((feature, index) => (
          <motion.button
            key={feature.id}
            onClick={() => setActiveFeature(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
              activeFeature === index
                ? 'bg-primary-50 border-2 border-primary-200 shadow-soft'
                : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-soft'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                activeFeature === index
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getIconComponent(feature.icon)}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${
                  activeFeature === index ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Right Column - Feature Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white mb-6">
            {getIconComponent(displayFeatures[activeFeature].icon)}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {displayFeatures[activeFeature].title}
          </h3>

          <p className="text-gray-700 mb-6 leading-relaxed text-lg">
            {displayFeatures[activeFeature].description}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {displayFeatures[activeFeature].benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 bg-white rounded-lg p-3"
              >
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {displayFeatures[activeFeature].ctaText && displayFeatures[activeFeature].ctaHref && (
            <motion.a
              href={displayFeatures[activeFeature].ctaHref}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg group"
            >
              {displayFeatures[activeFeature].ctaText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          )}

          {showInteractiveDemo && (
            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Interactive Demo</h4>
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full text-primary-600 hover:bg-primary-200 transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </motion.button>
              </div>
              <div className="relative bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Interactive demo for {displayFeatures[activeFeature].title}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Demo content would be dynamically loaded here
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Feature Content */}
        {layout === 'grid' ? renderGridLayout() : renderTabsLayout()}
      </div>
    </section>
  );
};

export default FeatureShowcase;
