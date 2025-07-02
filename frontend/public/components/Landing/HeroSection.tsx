'use client';

// Task 7.1.1: Public Landing Page Development
// Hero Section - Enhanced with modern visual effects and animations

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRight, 
  Play, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';
import { HeroSectionProps } from '@/types/landing';
import { fadeInUp, fadeInDown, staggerContainer, staggerItem } from '@/utils/animation';

interface ExtendedHeroSectionProps extends HeroSectionProps {
  features?: string[];
  trustIndicators?: string[];
  videoThumbnail?: string;
  stats?: {
    communities: number;
    votes: number;
    members: number;
  };
}

// Floating particles component
const FloatingParticles: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  if (windowSize.width === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const HeroSection: React.FC<ExtendedHeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  ctaHref,
  backgroundImage,
  showVideo = false,
  videoUrl,
  videoThumbnail,
  features = [],
  trustIndicators = [],
  stats
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.onloadeddata = () => setIsVideoLoaded(true);
    }
  }, [videoUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const defaultStats = {
    communities: 500,
    votes: 1500000,
    members: 75000
  };

  const displayStats = stats || defaultStats;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const defaultFeatures = [
    'Transparent blockchain voting',
    'Secure member authentication', 
    'Real-time vote counting',
    'Immutable vote records'
  ];

  const defaultTrustIndicators = [
    'SOC 2 Type II Certified',
    'End-to-end encryption',
    '99.9% uptime guarantee',
    'GDPR compliant'
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;
  const displayTrustIndicators = trustIndicators.length > 0 ? trustIndicators : defaultTrustIndicators;

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
        `
      }}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.05,
            y: mousePosition.y * 0.05,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.03,
            y: mousePosition.y * -0.03,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }}
          />
        </div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={inView ? "animate" : "initial"}
            className="text-center lg:text-left"
          >
            {/* Rating/Social Proof */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white text-sm font-medium">4.9/5 from 500+ communities</span>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
            >
              {displayTrustIndicators.map((indicator, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{indicator}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Heading with enhanced effects */}
            <motion.h1 
              variants={staggerItem}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {title}
              </span>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block ml-4"
              >
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </motion.div>
            </motion.h1>

            {/* Enhanced Subtitle */}
            <motion.p 
              variants={staggerItem}
              className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              {subtitle}
            </motion.p>

            {/* Features List with enhanced styling */}
            <motion.div 
              variants={staggerItem}
              className="grid sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto lg:mx-0"
            >
              {displayFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="flex items-center space-x-3 text-gray-200 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced CTA Buttons */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <motion.a
                href={ctaHref}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl group"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              {showVideo && videoUrl && (
                <motion.button
                  onClick={() => setShowVideoModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </motion.button>
              )}
            </motion.div>

            {/* Enhanced Stats with animated counters */}
            <motion.div 
              variants={staggerItem}
              className="grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { label: 'Communities', value: displayStats.communities, suffix: '+' },
                { label: 'Votes Cast', value: displayStats.votes, suffix: '+' },
                { label: 'Members', value: displayStats.members, suffix: '+' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ delay: 1.2 + index * 0.2 }}
                  className="text-center group"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    {formatNumber(stat.value)}{stat.suffix}
                  </motion.div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Enhanced Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={inView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -20 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            {showVideo && videoThumbnail ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <img
                  src={videoThumbnail}
                  alt="Platform Demo"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                  <motion.button
                    onClick={() => setShowVideoModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 bg-gradient-to-r from-white to-gray-100 rounded-full flex items-center justify-center shadow-2xl group"
                  >
                    <Play className="h-10 w-10 text-blue-600 ml-1 group-hover:scale-110 transition-transform" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Enhanced floating cards */}
                <motion.div
                  animate={{ 
                    y: [-10, 10, -10],
                    rotateX: [0, 5, 0],
                    rotateY: [0, -5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Shield className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-white font-bold text-lg mb-3">Secure Voting</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">Blockchain-powered security ensures every vote is protected</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: -10 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotateY: [360, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-white font-bold text-lg mb-3">Instant Results</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">Real-time vote counting with immediate result visibility</p>
                  </motion.div>
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [10, -10, 10],
                    rotateX: [0, -5, 0],
                    rotateY: [0, 5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                  className="absolute top-12 right-0 space-y-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotateX: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Users className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-white font-bold text-lg mb-3">Community Driven</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">Empower your members with transparent decision-making</p>
                  </motion.div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60"
                />
                <motion.div
                  animate={{ 
                    rotate: [360, 0],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-40"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Video Modal with enhanced styling */}
      {showVideoModal && videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, rotateY: -15 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.8, rotateY: 15 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-6 right-6 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center relative overflow-hidden">
          <motion.div 
            animate={{ y: [16, -16] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-1 h-4 bg-gradient-to-b from-white to-transparent rounded-full mt-3"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
