// Main Campaigns Page for Task 4.4.6
// Active Polls & Voting Campaigns Display

import React, { useState } from "react";
import { Campaign } from "../../types/campaign";
import CampaignDashboard from "../../components/Campaigns/CampaignDashboard";
import VotingModal from "../../components/Voting/VotingModal";

const CampaignsPage: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [votingCampaign, setVotingCampaign] = useState<Campaign | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    // You could navigate to a detailed view here
    // For now, we will open the voting modal
    setVotingCampaign(campaign);
    setShowVotingModal(true);
  };

  const handleVoteClick = (campaign: Campaign) => {
    setVotingCampaign(campaign);
    setShowVotingModal(true);
  };

  const handleVotingModalClose = () => {
    setShowVotingModal(false);
    setVotingCampaign(null);
  };

  const handleVoteSubmitted = (success: boolean) => {
    if (success) {
      // Could show a success message or refresh the dashboard
      console.log("Vote submitted successfully");
    } else {
      // Could show an error message
      console.log("Vote submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voting Campaigns</h1>
              <p className="mt-2 text-gray-600">
                Participate in community governance and decision-making
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CampaignDashboard
          onCampaignSelect={handleCampaignSelect}
          onVoteClick={handleVoteClick}
          showFilters={true}
          maxColumns={3}
        />
      </div>

      {/* Voting Modal */}
      {votingCampaign && (
        <VotingModal
          campaign={votingCampaign}
          isOpen={showVotingModal}
          onClose={handleVotingModalClose}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
