'use client';

// Task 7.1.1: Public Landing Page Development
// CTA Section - Call-to-action sections with trust signals

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, CheckCircle, Star, Shield } from 'lucide-react';

interface CTASectionProps {
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
  showTrustSignals?: boolean;
  trustSignals?: string[];
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  backgroundColor = 'bg-gray-900',
  pattern = 'none',
  showTrustSignals = false,
  trustSignals = []
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const getButtonClasses = (variant: string, isPrimary: boolean = true) => {
    const baseClasses = "inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-300 shadow-lg";
    
    if (backgroundColor.includes('gray-900') || backgroundColor.includes('primary')) {
      // Dark background
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-white text-gray-900 hover:bg-gray-100`;
        case 'outline':
          return `${baseClasses} bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900`;
        default:
          return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700`;
      }
    } else {
      // Light background
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700`;
        case 'outline':
          return `${baseClasses} bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`;
      }
    }
  };

  const getPatternClasses = () => {
    switch (pattern) {
      case 'gradient':
        return 'bg-gradient-to-r from-primary-600 to-primary-700';
      case 'dots':
        return `${backgroundColor} relative overflow-hidden`;
      case 'waves':
        return `${backgroundColor} relative`;
      default:
        return backgroundColor;
    }
  };

  const renderPattern = () => {
    if (pattern === 'dots') {
      return (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />
        </div>
      );
    }
    return null;
  };

  return (
    <section ref={ref} className={`py-20 ${getPatternClasses()} relative overflow-hidden`}>
      {renderPattern()}
      
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{ 
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 3 + 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
            backgroundColor.includes('gray-900') || backgroundColor.includes('primary') 
              ? 'text-white' 
              : 'text-gray-900'
          }`}>
            {title}
          </h2>
          
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            backgroundColor.includes('gray-900') || backgroundColor.includes('primary')
              ? 'text-gray-200'
              : 'text-gray-600'
          }`}>
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.a
              href={primaryButton.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${getButtonClasses(primaryButton.variant, true)} group`}
            >
              {primaryButton.text}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            {secondaryButton && (
              <motion.a
                href={secondaryButton.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={getButtonClasses(secondaryButton.variant, false)}
              >
                {secondaryButton.text}
              </motion.a>
            )}
          </div>

          {/* Trust Signals */}
          {showTrustSignals && trustSignals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {trustSignals.map((signal, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 ${
                    backgroundColor.includes('gray-900') || backgroundColor.includes('primary')
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}
                >
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium">{signal}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Additional Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`mt-8 flex items-center justify-center space-x-6 text-sm ${
              backgroundColor.includes('gray-900') || backgroundColor.includes('primary')
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span>SOC 2 Certified</span>
            </div>
            <div>
              <span>500+ Communities</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
