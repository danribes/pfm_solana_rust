// Task 4.5.2: Hero Section Component
// Main landing page hero with value proposition and call-to-action

import React, { useState, useEffect } from "react";
import { HeroContent, PlatformStats } from "../../types/public";
import { useAnalytics, useComponentAnalytics } from "../../hooks/useAnalytics";
import { discoveryService } from "../../services/discovery";

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

export interface HeroSectionProps {
  content?: Partial<HeroContent>;
  showVideo?: boolean;
  showStats?: boolean;
  className?: string;
  onCtaClick?: (ctaType: "primary" | "secondary") => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  content = {},
  showVideo = true,
  showStats = true,
  className = "",
  onCtaClick,
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackPageView } = useAnalytics();
  const { trackClick, trackHover } = useComponentAnalytics("HeroSection");
  
  // ========================================================================
  // STATE
  // ========================================================================

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [heroData, setHeroData] = useState<HeroContent>({
    headline: "Empower Your Community with Blockchain Voting",
    subheadline: "Transparent, Secure, Democratic",
    description: "Join thousands of communities making decisions together through secure blockchain voting. Build trust, increase engagement, and create lasting impact.",
    primaryCTA: {
      text: "Get Started Free",
      url: "/register",
      variant: "primary" as any,
      trackingEvent: "hero_cta_primary",
      isExternal: false,
    },
    secondaryCTA: {
      text: "Explore Communities",
      url: "/discover",
      variant: "outline" as any,
      trackingEvent: "hero_cta_secondary",
      isExternal: false,
    },
    backgroundImage: "/images/hero-bg.jpg",
    videoUrl: "/videos/platform-demo.mp4",
    statsPreview: {
      totalCommunities: 0,
      totalMembers: 0,
      totalVotes: 0,
      totalProposals: 0,
      lastUpdated: new Date().toISOString(),
    },
    ...content,
  });

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    // Load platform statistics
    if (showStats) {
      discoveryService.getPlatformStats()
        .then(setStats)
        .catch(console.error);
    }
  }, [showStats]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleCtaClick = (ctaType: "primary" | "secondary", url: string) => {
    trackClick(`cta_${ctaType}`, { url, section: "hero" });
    onCtaClick?.(ctaType);
    
    // Navigate if not handled by parent
    if (!onCtaClick) {
      window.location.href = url;
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    trackClick("video_play", { section: "hero" });
  };

  const handleVideoHover = () => {
    trackHover("video_thumbnail");
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderStats = () => {
    if (!showStats || !stats) return null;

    const statsData = [
      { label: "Active Communities", value: stats.totalCommunities, suffix: "+" },
      { label: "Community Members", value: stats.totalMembers, suffix: "+" },
      { label: "Votes Cast", value: stats.totalVotes, suffix: "+" },
      { label: "Proposals Created", value: stats.totalProposals, suffix: "+" },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-12">
        {statsData.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatStatValue(stat.value)}{stat.suffix}
            </div>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVideoSection = () => {
    if (!showVideo || !heroData.videoUrl) return null;

    return (
      <div className="relative">
        {!isVideoPlaying ? (
          <div 
            className="relative cursor-pointer group"
            onClick={handleVideoPlay}
            onMouseEnter={handleVideoHover}
          >
            <img
              src="/images/video-thumbnail.jpg"
              alt="Platform Demo"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-2xl group-hover:shadow-3xl transition-shadow duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-300">
                <div className="w-0 h-0 border-l-[12px] md:border-l-[16px] border-l-blue-600 border-t-[8px] md:border-t-[10px] border-t-transparent border-b-[8px] md:border-b-[10px] border-b-transparent ml-1"></div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
              Watch Demo (2:30)
            </div>
          </div>
        ) : (
          <video
            src={heroData.videoUrl}
            controls
            autoPlay
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-2xl"
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <section 
      className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 overflow-hidden ${className}`}
      style={{
        backgroundImage: heroData.backgroundImage ? `url(${heroData.backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-10 translate-x-48 translate-y-48"></div>
      
      <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Column */}
          <div className="text-center lg:text-left">
            
            {/* Subheadline */}
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ {heroData.subheadline}
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {heroData.headline}
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {heroData.description}
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={() => handleCtaClick("primary", heroData.primaryCTA.url)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                aria-label={heroData.primaryCTA.text}
              >
                {heroData.primaryCTA.text}
              </button>
              
              <button
                onClick={() => handleCtaClick("secondary", heroData.secondaryCTA.url)}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                aria-label={heroData.secondaryCTA.text}
              >
                {heroData.secondaryCTA.text}
              </button>
            </div>
            
            {/* Statistics */}
            {renderStats()}
          </div>
          
          {/* Visual Column */}
          <div className="flex justify-center lg:justify-end">
            {showVideo ? renderVideoSection() : (
              <div className="relative">
                <img
                  src="/images/hero-illustration.png"
                  alt="Blockchain Voting Platform"
                  className="w-full max-w-lg h-auto"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Trusted by leading communities worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {/* Placeholder for community logos */}
            {[1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index}
                className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"
                aria-label={`Partner logo ${index}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatStatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export default HeroSection;
