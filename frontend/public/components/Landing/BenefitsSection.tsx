'use client';

// Task 7.1.1: Public Landing Page Development
// Benefits Section - Value proposition explanation for different user types

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Users, 
  Building, 
  Crown, 
  Target,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  User,
  Briefcase
} from 'lucide-react';
import { BenefitItem } from '@/types/landing';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animation';

interface BenefitsSectionProps {
  benefits?: BenefitItem[];
  title?: string;
  subtitle?: string;
  showUserTypeFilter?: boolean;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  benefits,
  title = "Benefits for Every Type of Community",
  subtitle = "Discover how our platform delivers value across different community structures and use cases",
  showUserTypeFilter = true
}) => {
  const [activeUserType, setActiveUserType] = useState<'all' | 'community-admin' | 'member' | 'organization'>('all');
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const defaultBenefits: BenefitItem[] = [
    {
      id: 'transparent-governance',
      title: 'Transparent Governance',
      description: 'Enable complete transparency in decision-making with immutable blockchain records that members can verify.',
      icon: 'Shield',
      userType: 'community-admin',
// Highlighted benefits implementation for featured benefits display
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
      id: 'instant-results',
      title: 'Instant Vote Results',
      description: 'Get real-time vote counts and instant results publication without waiting for manual tabulation.',
      icon: 'Clock',
      userType: 'all',
      highlight: false
    },
    {
      id: 'secure-voting',
      title: 'Secure & Private Voting',
      description: 'Vote with confidence knowing your choices are protected by military-grade encryption and blockchain security.',
      icon: 'Shield',
      userType: 'member',
      highlight: true
    },
    {
      id: 'accessible-participation',
      title: 'Accessible Participation',
      description: 'Participate from anywhere, anytime with mobile-optimized interfaces that work across all devices.',
      icon: 'Target',
      userType: 'member',
      highlight: false
    },
    {
      id: 'compliance-assurance',
      title: 'Regulatory Compliance',
      description: 'Meet all regulatory requirements with built-in compliance features and comprehensive audit trails.',
      icon: 'CheckCircle',
      userType: 'organization',
      highlight: false
    },
    {
      id: 'scalable-growth',
      title: 'Scalable Growth',
      description: 'Grow your community without worrying about infrastructure limits or performance degradation.',
      icon: 'TrendingUp',
      userType: 'all',
      highlight: true
    }
  ];

  const displayBenefits = benefits && benefits.length > 0 ? benefits : defaultBenefits;

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Shield: <Shield className="h-8 w-8" />,
      TrendingUp: <TrendingUp className="h-8 w-8" />,
      DollarSign: <DollarSign className="h-8 w-8" />,
      Clock: <Clock className="h-8 w-8" />,
      Target: <Target className="h-8 w-8" />,
      CheckCircle: <CheckCircle className="h-8 w-8" />
    };
    return iconMap[iconName] || <CheckCircle className="h-8 w-8" />;
  };

  const userTypes = [
    { key: 'all', label: 'All Users', icon: Users, color: 'primary' },
    { key: 'community-admin', label: 'Community Admins', icon: Crown, color: 'purple' },
    { key: 'member', label: 'Members', icon: User, color: 'blue' },
    { key: 'organization', label: 'Organizations', icon: Building, color: 'green' }
  ] as const;

  const filteredBenefits = activeUserType === 'all' 
    ? displayBenefits 
    : displayBenefits.filter(benefit => benefit.userType === activeUserType || benefit.userType === 'all');

  const getColorClasses = (color: string, highlighted: boolean = false) => {
    const colorMap = {
      primary: {
        bg: highlighted ? 'bg-primary-600' : 'bg-primary-100',
        text: highlighted ? 'text-white' : 'text-primary-600',
        border: 'border-primary-200',
        hover: 'hover:bg-primary-50'
      },
      purple: {
        bg: highlighted ? 'bg-purple-600' : 'bg-purple-100',
        text: highlighted ? 'text-white' : 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-50'
      },
      blue: {
        bg: highlighted ? 'bg-blue-600' : 'bg-blue-100',
        text: highlighted ? 'text-white' : 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-50'
      },
      green: {
        bg: highlighted ? 'bg-green-600' : 'bg-green-100',
        text: highlighted ? 'text-white' : 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-50'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <section ref={ref} className="py-20 bg-white">
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

        {/* User Type Filter */}
        {showUserTypeFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {userTypes.map((type) => {
              const IconComponent = type.icon;
              const isActive = activeUserType === type.key;
              const colors = getColorClasses(type.color, isActive);
              
              return (
                <motion.button
                  key={type.key}
                  onClick={() => setActiveUserType(type.key as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive 
                      ? `${colors.bg} ${colors.text} shadow-lg` 
                      : `bg-white ${colors.text} border-2 ${colors.border} ${colors.hover} shadow-soft`
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{type.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Benefits Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUserType}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="initial"
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredBenefits.map((benefit) => {
              const currentUserType = userTypes.find(type => type.key === benefit.userType) || userTypes[0];
              const colors = getColorClasses(currentUserType.color, benefit.highlight);
              
              return (
                <motion.div
                  key={benefit.id}
                  variants={staggerItem}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`relative bg-white rounded-2xl p-8 transition-all duration-300 ${
                    benefit.highlight 
                      ? 'shadow-strong border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white' 
                      : 'shadow-soft hover:shadow-medium border border-gray-100'
                  }`}
                >
                  {benefit.highlight && (
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Popular
                      </div>
                    </div>
                  )}

                  {/* User Type Badge */}
                  {benefit.userType !== 'all' && (
                    <div className={`inline-flex items-center space-x-2 ${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium mb-4`}>
                      <currentUserType.icon className="h-4 w-4" />
                      <span>{currentUserType.label}</span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                    benefit.highlight 
                      ? 'bg-primary-600 text-white' 
                      : `${colors.bg} ${colors.text}`
                  }`}>
                    {getIconComponent(benefit.icon)}
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-semibold mb-4 ${
                    benefit.highlight ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {benefit.title}
                  </h3>

                  <p className={`leading-relaxed ${
                    benefit.highlight ? 'text-primary-700' : 'text-gray-600'
                  }`}>
                    {benefit.description}
                  </p>

                  {/* Learn More Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="mt-6 opacity-0 transition-opacity duration-300"
                  >
                    <a
                      href={`/benefits/${benefit.id}`}
                      className={`inline-flex items-center font-medium ${
                        benefit.highlight ? 'text-primary-600' : colors.text
                      } hover:underline group`}
                    >
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Community?
            </h3>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of communities already using our platform to conduct secure, transparent voting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
// Conversion CTA section for user acquisition and signups
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="/demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-600 transition-colors group"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Schedule Demo
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
