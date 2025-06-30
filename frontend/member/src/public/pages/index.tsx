// Task 4.5.2: Main Landing Page
// Public landing page with hero, features, and community showcase

import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import HeroSection from "../components/Landing/HeroSection";
import FeatureHighlights from "../components/Landing/FeatureHighlights";
import CommunityShowcase from "../components/Landing/CommunityShowcase";

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

const LandingPage: React.FC = () => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackPageView } = useAnalytics();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  React.useEffect(() => {
    trackPageView("landing_page", {
      section: "public",
      pageType: "landing",
    });
  }, [trackPageView]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleHeroCtaClick = (ctaType: "primary" | "secondary") => {
    if (ctaType === "primary") {
      // Navigate to registration
      window.location.href = "/register";
    } else {
      // Navigate to discovery
      window.location.href = "/discover";
    }
  };

  const handleCommunityClick = (community: any) => {
    // Navigate to community page
    window.location.href = `/communities/${community.id}`;
  };

  const handleViewAllCommunities = () => {
    window.location.href = "/discover";
  };

  const handleFeatureClick = (feature: any) => {
    // Navigate to feature details or demo
    window.location.href = `/features/${feature.id}`;
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection
        onCtaClick={handleHeroCtaClick}
        showVideo={true}
        showStats={true}
      />
      
      {/* Feature Highlights */}
      <FeatureHighlights
        onFeatureClick={handleFeatureClick}
        layout="grid"
        showIcons={true}
        showImages={false}
      />
      
      {/* Community Showcase */}
      <CommunityShowcase
        limit={6}
        showStats={true}
        showActivity={true}
        layout="grid"
        onCommunityClick={handleCommunityClick}
        onViewAll={handleViewAllCommunities}
      />
      
      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using blockchain voting for transparent, secure decision-making.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleHeroCtaClick("primary")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Your Community
            </button>
            <button
              onClick={() => handleViewAllCommunities()}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Explore Communities
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
