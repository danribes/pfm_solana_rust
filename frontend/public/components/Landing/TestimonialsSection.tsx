'use client';

// Task 7.1.1: Public Landing Page Development
// Testimonials Section - Social proof display with verified testimonials

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Verified,
  Building,
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { TestimonialItem } from '@/types/landing';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animation';

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  showRatings?: boolean;
  layout?: 'carousel' | 'grid' | 'featured';
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  title = "Trusted by Communities Worldwide",
  subtitle = "See what community leaders and members are saying about our platform",
  autoPlay = true,
  showRatings = true,
  layout = 'carousel'
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const defaultTestimonials: TestimonialItem[] = [
    {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      role: 'Community Manager',
      organization: 'Tech Workers Collective',
      content: 'The platform has completely transformed how we conduct votes. Our engagement has increased by 300% since switching to blockchain voting. The transparency and security give our members complete confidence.',
      avatar: '/images/testimonials/sarah-johnson.jpg',
      rating: 5,
      verified: true
    },
    {
      id: 'michael-chen',
      name: 'Michael Chen',
      role: 'President',
      organization: 'Digital Arts DAO',
      content: 'As a DAO, transparency is everything to us. This platform provides the immutable records and real-time verification we need. The user experience is fantastic - even non-technical members love it.',
      avatar: '/images/testimonials/michael-chen.jpg',
      rating: 5,
      verified: true
    },
    {
      id: 'emily-rodriguez',
      name: 'Emily Rodriguez',
      role: 'Executive Director',
      organization: 'Green Future Cooperative',
      content: 'We saved over $15,000 annually by eliminating paper ballots and manual counting. The instant results and automated notifications have streamlined our entire governance process.',
      avatar: '/images/testimonials/emily-rodriguez.jpg',
// Ratings stars implementation for testimonial display
      rating: 5,
      verified: true
    },
    {
      id: 'james-wilson',
      name: 'James Wilson',
      role: 'Board Member',
      organization: 'Community Housing Trust',
      content: 'The security features are impressive. Our legal team was initially skeptical about digital voting, but the blockchain audit trail and compliance features convinced them completely.',
      avatar: '/images/testimonials/james-wilson.jpg',
      rating: 4,
      verified: true
    },
    {
      id: 'lisa-martinez',
      name: 'Lisa Martinez',
      role: 'Governance Lead',
      organization: 'Innovation Hub Network',
      content: 'The mobile interface is incredible. Our younger members participate so much more now that they can vote from their phones. The accessibility features also help our older members.',
      avatar: '/images/testimonials/lisa-martinez.jpg',
      rating: 5,
      verified: true
    },
    {
      id: 'david-kim',
      name: 'David Kim',
      role: 'Secretary',
      organization: 'Freelancers Union Local 401',
      content: 'Real-time results changed everything for us. No more waiting days for vote counts or worrying about human error. Our members get immediate feedback and the process feels much more democratic.',
      avatar: '/images/testimonials/david-kim.jpg',
      rating: 5,
      verified: true
    }
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isPaused && layout === 'carousel') {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => 
          prev === displayTestimonials.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [autoPlay, isPaused, displayTestimonials.length, layout]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === displayTestimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? displayTestimonials.length - 1 : prev - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderCarouselLayout = () => (
    <div className="relative max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTestimonial}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-strong p-8 md:p-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative">
            {/* Quote Icon */}
            <Quote className="h-12 w-12 text-primary-200 mb-6" />
            
            {/* Testimonial Content */}
            <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
              "{displayTestimonials[currentTestimonial].content}"
            </blockquote>

            {/* Rating */}
            {showRatings && (
              <div className="flex items-center space-x-1 mb-6">
                {renderStars(displayTestimonials[currentTestimonial].rating)}
              </div>
            )}

            {/* Author Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={displayTestimonials[currentTestimonial].avatar}
                  alt={displayTestimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${displayTestimonials[currentTestimonial].name}&background=3b82f6&color=ffffff&size=64`;
                  }}
                />
                {displayTestimonials[currentTestimonial].verified && (
                  <Verified className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-500 bg-white rounded-full" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {displayTestimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600">
                  {displayTestimonials[currentTestimonial].role}
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Building className="h-4 w-4" />
                  <span>{displayTestimonials[currentTestimonial].organization}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevTestimonial}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-xl transition-all duration-300"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextTestimonial}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-xl transition-all duration-300"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-8">
        {displayTestimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentTestimonial
                ? 'bg-primary-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderGridLayout = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {displayTestimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          variants={staggerItem}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-100"
        >
          {/* Quote Icon */}
          <Quote className="h-8 w-8 text-primary-200 mb-4" />
          
          {/* Content */}
          <blockquote className="text-gray-700 leading-relaxed mb-6">
            "{testimonial.content}"
          </blockquote>

          {/* Rating */}
          {showRatings && (
            <div className="flex items-center space-x-1 mb-4">
              {renderStars(testimonial.rating)}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=3b82f6&color=ffffff&size=48`;
                }}
              />
              {testimonial.verified && (
                <Verified className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-500 bg-white rounded-full" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {testimonial.name}
              </div>
              <div className="text-gray-600 text-sm">
                {testimonial.role}
              </div>
              <div className="text-gray-500 text-xs">
                {testimonial.organization}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderFeaturedLayout = () => {
    const featuredTestimonial = displayTestimonials[0];
    const otherTestimonials = displayTestimonials.slice(1, 4);

    return (
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white"
        >
          <Quote className="h-12 w-12 text-primary-200 mb-6" />
          
          <blockquote className="text-xl md:text-2xl leading-relaxed mb-8 font-medium">
            "{featuredTestimonial.content}"
          </blockquote>

          {showRatings && (
            <div className="flex items-center space-x-1 mb-6">
              {renderStars(featuredTestimonial.rating)}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={featuredTestimonial.avatar}
                alt={featuredTestimonial.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${featuredTestimonial.name}&background=ffffff&color=3b82f6&size=64`;
                }}
              />
              {featuredTestimonial.verified && (
                <Verified className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-400 bg-white rounded-full" />
              )}
            </div>
            <div>
              <div className="font-semibold text-white text-lg">
                {featuredTestimonial.name}
              </div>
              <div className="text-primary-200">
                {featuredTestimonial.role}
              </div>
              <div className="text-primary-300 text-sm">
                {featuredTestimonial.organization}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Testimonials */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {otherTestimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center space-x-1 mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote className="text-gray-700 mb-4 text-sm leading-relaxed">
                "{testimonial.content.substring(0, 120)}..."
              </blockquote>

              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=3b82f6&color=ffffff&size=40`;
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {testimonial.role}, {testimonial.organization}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
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

        {/* Testimonials Content */}
        {layout === 'carousel' && renderCarouselLayout()}
        {layout === 'grid' && renderGridLayout()}
        {layout === 'featured' && renderFeaturedLayout()}

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">Active Communities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">1M+</div>
            <div className="text-gray-600">Votes Processed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
