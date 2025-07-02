'use client';

// Task 7.1.1: Public Landing Page Development
// How It Works Section - Process explanation with visual guides

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HowItWorksStep } from '@/types/landing';
import { Settings, FileText, Vote, BarChart } from 'lucide-react';

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
  title?: string;
  subtitle?: string;
  showInteractiveDemo?: boolean;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  steps,
  title = "How It Works",
  subtitle = "Get started in four simple steps",
  showInteractiveDemo = true
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Settings: <Settings className="h-8 w-8" />,
      FileText: <FileText className="h-8 w-8" />,
      Vote: <Vote className="h-8 w-8" />,
      BarChart: <BarChart className="h-8 w-8" />
    };
    return iconMap[iconName] || <Settings className="h-8 w-8" />;
  };

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center relative"
            >
              {/* Step Number */}
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                {getIconComponent(step.icon)}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-6">{step.description}</p>

              {/* Details */}
              <ul className="text-sm text-gray-500 space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex}>• {detail}</li>
                ))}
              </ul>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 transform -translate-x-8"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
