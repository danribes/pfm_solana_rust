// Campaign List Component for Admin Dashboard
import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '../../types/campaign';
import { useCampaigns } from '../../hooks/useCampaigns';

interface CampaignListProps {
  onEditCampaign: (campaign: Campaign) => void;
  onViewAnalytics: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ 
  onEditCampaign, 
  onViewAnalytics 
}) => {
  const { campaigns, loading, error, deleteCampaign } = useCampaigns({ autoRefresh: true });
  const [filter, setFilter] = useState<CampaignStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesFilter = filter === 'all' || campaign.status === filter;
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CampaignStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case CampaignStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case CampaignStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      case CampaignStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case CampaignStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
      try {
        await deleteCampaign(campaign.id);
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading campaigns: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CampaignStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Campaigns</option>
            <option value={CampaignStatus.ACTIVE}>Active</option>
            <option value={CampaignStatus.DRAFT}>Draft</option>
            <option value={CampaignStatus.SCHEDULED}>Scheduled</option>
            <option value={CampaignStatus.COMPLETED}>Completed</option>
            <option value={CampaignStatus.PAUSED}>Paused</option>
          </select>
        </div>
        
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {campaign.title}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {campaign.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span>{campaign.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{campaign.totalParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Votes:</span>
                  <span>{campaign.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participation Rate:</span>
                  <span>{Math.round(campaign.participationRate)}%</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-4">
                <div>Start: {new Date(campaign.startDate).toLocaleDateString()}</div>
                <div>End: {new Date(campaign.endDate).toLocaleDateString()}</div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(campaign.participationRate)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(campaign.participationRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEditCampaign(campaign)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onViewAnalytics(campaign)}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleDelete(campaign)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No campaigns found</div>
          <div className="text-gray-500 text-sm">
            {filter !== 'all' ? 'Try changing the filter' : 'Create your first campaign to get started'}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
            <div className="text-sm text-gray-500">Total Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {campaigns.reduce((sum, c) => sum + c.totalParticipants, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
};
