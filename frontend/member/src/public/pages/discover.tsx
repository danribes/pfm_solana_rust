// Task 4.5.2: Community Discovery Page
// Public discovery page with advanced search and filtering

import React from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import CommunityGrid from "../components/Discovery/CommunityGrid";

// ============================================================================
// DISCOVERY PAGE COMPONENT
// ============================================================================

const DiscoveryPage: React.FC = () => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackPageView } = useAnalytics();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  React.useEffect(() => {
    trackPageView("discovery_page", {
      section: "public",
      pageType: "discovery",
    });
  }, [trackPageView]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleCommunitySelect = (community: any) => {
    // Navigate to community page
    window.location.href = `/communities/${community.id}`;
  };

  const handleFiltersChange = (filters: any) => {
    // Update URL parameters for sharing/bookmarking
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (!Array.isArray(value)) {
          params.set(key, String(value));
        }
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="min-h-screen">
      <CommunityGrid
        showFilters={true}
        showSearch={true}
        showSorting={true}
        viewMode="grid"
        onCommunitySelect={handleCommunitySelect}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
};

export default DiscoveryPage;
