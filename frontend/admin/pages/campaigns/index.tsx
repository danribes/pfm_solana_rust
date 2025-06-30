// Main Campaigns Dashboard Page
import React, { useState } from 'react';
import { Campaign } from '../../types/campaign';
import { CampaignList } from '../../components/Campaigns/CampaignList';
import { CampaignWizard } from '../../components/Campaigns/CampaignWizard';
import { CampaignAnalytics } from '../../components/Campaigns/CampaignAnalytics';

type ViewMode = 'list' | 'create' | 'analytics';

const CampaignsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleCreateCampaign = () => {
    setViewMode('create');
    setSelectedCampaign(null);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('create');
  };

  const handleViewAnalytics = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('analytics');
  };

  const handleCampaignCreated = (campaign: Campaign) => {
    setViewMode('list');
    setSelectedCampaign(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedCampaign(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <CampaignWizard
            onComplete={handleCampaignCreated}
            onCancel={handleCancel}
          />
        );
      
      case 'analytics':
        return selectedCampaign ? (
          <div>
            <button
              onClick={() => setViewMode('list')}
              className="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Campaigns
            </button>
            <CampaignAnalytics campaign={selectedCampaign} />
          </div>
        ) : (
          <div>No campaign selected</div>
        );
      
      case 'list':
      default:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                <p className="text-gray-600">Manage voting campaigns and track participation</p>
              </div>
              
              <button
                onClick={handleCreateCampaign}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Campaign
              </button>
            </div>
            
            <CampaignList
              onEditCampaign={handleEditCampaign}
              onViewAnalytics={handleViewAnalytics}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default CampaignsPage;
