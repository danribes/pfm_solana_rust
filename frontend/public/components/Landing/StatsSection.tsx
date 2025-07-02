'use client';

// Enhanced Stats Section with animated counters and modern visual effects

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Vote, Building2, Clock } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

interface StatsSectionProps {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
}

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const animate = () => {
    if (hasAnimated) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setHasAnimated(true);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  return { count, animate };
};

const StatCard: React.FC<{ stat: StatItem; index: number; inView: boolean }> = ({ stat, index, inView }) => {
  const { count, animate } = useAnimatedCounter(stat.value, 2000 + index * 200);

  useEffect(() => {
    if (inView) {
      animate();
    }
  }, [inView, animate]);

  const formatNumber = (num: number) => {
    if (stat.unit === '%') return num.toFixed(1);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getIcon = (id: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      communities: <Building2 className="h-8 w-8" />,
      votes: <Vote className="h-8 w-8" />,
      members: <Users className="h-8 w-8" />,
      uptime: <Clock className="h-8 w-8" />
    };
    return iconMap[id] || <TrendingUp className="h-8 w-8" />;
  };

  const getTrendIcon = () => {
    switch (stat.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (stat.trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -10, 
        scale: 1.05,
        rotateY: 5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      whileTap={{ scale: 0.95 }}
      className="group relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl p-8 border border-gray-100 hover:border-primary-200 shadow-soft hover:shadow-strong transition-all duration-500 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-50/10 to-primary-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating orbs */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-200/30 to-purple-200/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-emerald-200/40 to-cyan-200/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-lg" />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          whileHover={{ 
            scale: 1.2, 
            rotate: 10,
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
          }}
          className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {getIcon(stat.id)}
          </motion.div>
        </motion.div>

        {/* Value */}
        <div className="mb-4">
          <motion.div 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-purple-800 bg-clip-text text-transparent mb-2"
            key={count}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(count)}{stat.unit}
          </motion.div>
          
          {/* Trend indicator */}
          {stat.trend && stat.trendValue && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>+{stat.trendValue}%</span>
            </motion.div>
          )}
        </div>

        {/* Label */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-900 transition-colors">
          {stat.label}
        </h3>

        {/* Description */}
        <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
          {stat.description}
        </p>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
    </motion.div>
  );
};

const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  title = "Trusted by Communities Worldwide",
  subtitle = "See the impact we're making across different community types"
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.3, once: true });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-purple-800 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.id} 
              stat={stat} 
              index={index} 
              inView={inView}
            />
          ))}
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary-200/20 to-purple-200/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-xl"
        />
      </div>
    </section>
  );
};

export default StatsSection;
