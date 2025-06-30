// Task 4.5.2: Feature Highlights Component  
// Showcases platform features and benefits

import React from "react";
import { FeatureHighlight, FeatureCategory } from "../../types/public";
import { useComponentAnalytics } from "../../hooks/useAnalytics";

// ============================================================================
// FEATURE HIGHLIGHTS COMPONENT
// ============================================================================

export interface FeatureHighlightsProps {
  features?: FeatureHighlight[];
  title?: string;
  subtitle?: string;
  layout?: "grid" | "carousel" | "list";
  showIcons?: boolean;
  showImages?: boolean;
  className?: string;
  onFeatureClick?: (feature: FeatureHighlight) => void;
}

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  features = defaultFeatures,
  title = "Why Choose Our Platform",
  subtitle = "Everything you need for democratic community governance",
  layout = "grid",
  showIcons = true,
  showImages = false,
  className = "",
  onFeatureClick,
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackClick, trackHover } = useComponentAnalytics("FeatureHighlights");

  // ========================================================================
  // EVENT HANDLERS  
  // ========================================================================

  const handleFeatureClick = (feature: FeatureHighlight, event: React.MouseEvent) => {
    event.preventDefault();
    trackClick("feature_item", { 
      featureId: feature.id,
      featureTitle: feature.title,
      category: feature.category 
    });
    onFeatureClick?.(feature);
  };

  const handleFeatureHover = (feature: FeatureHighlight) => {
    trackHover(`feature_${feature.id}`);
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderFeatureIcon = (feature: FeatureHighlight) => {
    if (!showIcons) return null;

    const iconMap = {
      [FeatureCategory.GOVERNANCE]: "⚖️",
      [FeatureCategory.SECURITY]: "🔐",
      [FeatureCategory.TRANSPARENCY]: "👁️",
      [FeatureCategory.COMMUNITY]: "👥",
      [FeatureCategory.TECHNOLOGY]: "⚙️",
    };

    return (
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
        <span className="text-2xl">
          {feature.icon || iconMap[feature.category] || "🔗"}
        </span>
      </div>
    );
  };

  const renderFeatureImage = (feature: FeatureHighlight) => {
    if (!showImages || !feature.imageUrl) return null;

    return (
      <div className="mb-6 overflow-hidden rounded-lg">
        <img
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const renderFeature = (feature: FeatureHighlight, index: number) => (
    <div
      key={feature.id}
      className="group bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onClick={(event: React.MouseEvent) => handleFeatureClick(feature, event)}
      onMouseEnter={() => handleFeatureHover(feature)}
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${feature.title}`}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          handleFeatureClick(feature, e as any);
        }
      }}
    >
      {renderFeatureImage(feature)}
      {renderFeatureIcon(feature)}
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {feature.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
        {feature.description}
      </p>
      
      {feature.benefits && feature.benefits.length > 0 && (
        <ul className="space-y-2 mb-6">
          {feature.benefits.map((benefit, benefitIndex) => (
            <li
              key={benefitIndex}
              className="flex items-center text-sm text-gray-700 dark:text-gray-300"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
              {benefit}
            </li>
          ))}
        </ul>
      )}
      
      <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
        Learn more →
      </div>
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {features.map(renderFeature)}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-8">
      {features.map((feature, index) => (
        <div
          key={feature.id}
          className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-12 items-center`}
        >
          <div className="flex-1">
            {renderFeature(feature, index)}
          </div>
          {feature.imageUrl && (
            <div className="flex-1">
              <img
                src={feature.imageUrl}
                alt={feature.title}
                className="w-full h-64 lg:h-80 object-cover rounded-xl"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <section className={`py-16 md:py-24 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Features Content */}
        {layout === "grid" && renderGridLayout()}
        {layout === "list" && renderListLayout()}
        
        {/* Call to Action */}
        <div className="text-center mt-12 md:mt-16">
          <button
            onClick={(event: React.MouseEvent) => {
              event.preventDefault();
              trackClick("cta_features", { section: "features" });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            Start Building Your Community
          </button>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// DEFAULT FEATURES DATA
// ============================================================================

const defaultFeatures: FeatureHighlight[] = [
  {
    id: "secure-voting",
    title: "Secure Blockchain Voting",
    description: "Tamper-proof voting with cryptographic security ensuring every vote is counted accurately and transparently.",
    icon: "🔐",
    imageUrl: "/images/features/secure-voting.jpg",
    benefits: [
      "Immutable vote records",
      "End-to-end encryption",
      "Multi-signature verification",
      "Audit trail transparency"
    ],
    category: FeatureCategory.SECURITY,
    order: 1,
  },
  {
    id: "community-governance",
    title: "Democratic Governance",
    description: "Empower your community with structured decision-making processes and transparent proposal management.",
    icon: "⚖️",
    imageUrl: "/images/features/governance.jpg",
    benefits: [
      "Proposal creation and voting",
      "Member role management", 
      "Quorum and threshold settings",
      "Decision execution tracking"
    ],
    category: FeatureCategory.GOVERNANCE,
    order: 2,
  },
  {
    id: "real-time-transparency",
    title: "Real-Time Transparency",
    description: "Monitor voting progress, participation rates, and results in real-time with comprehensive analytics.",
    icon: "👁️",
    imageUrl: "/images/features/transparency.jpg",
    benefits: [
      "Live voting statistics",
      "Participation analytics",
      "Public audit logs",
      "Result verification"
    ],
    category: FeatureCategory.TRANSPARENCY,
    order: 3,
  },
  {
    id: "community-engagement",
    title: "Enhanced Engagement",
    description: "Boost community participation with gamification, notifications, and social features.",
    icon: "👥",
    imageUrl: "/images/features/engagement.jpg",
    benefits: [
      "Member activity tracking",
      "Reputation systems",
      "Achievement badges",
      "Social interactions"
    ],
    category: FeatureCategory.COMMUNITY,
    order: 4,
  },
  {
    id: "scalable-technology",
    title: "Scalable Technology",
    description: "Built on cutting-edge blockchain technology that scales with your community growth.",
    icon: "⚙️",
    imageUrl: "/images/features/technology.jpg",
    benefits: [
      "High transaction throughput",
      "Low fees and fast confirmation",
      "Cross-chain compatibility",
      "Mobile-first design"
    ],
    category: FeatureCategory.TECHNOLOGY,
    order: 5,
  },
  {
    id: "easy-integration",
    title: "Easy Integration",
    description: "Seamlessly integrate with existing systems and workflows through our comprehensive API.",
    icon: "🔗",
    imageUrl: "/images/features/integration.jpg",
    benefits: [
      "RESTful API access",
      "Webhook notifications",
      "Third-party integrations",
      "Custom branding options"
    ],
    category: FeatureCategory.TECHNOLOGY,
    order: 6,
  },
];

export default FeatureHighlights;
