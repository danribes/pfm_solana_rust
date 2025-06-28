import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AppLayout } from '../../components/Layout';
import { CommunityList, CommunityForm } from '../../components/Communities';
import { useCommunityCreate, useCommunity } from '../../hooks/useCommunities';

type ViewMode = 'list' | 'create' | 'edit';

const CommunitiesPage: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const { createCommunity, loading: createLoading, error: createError } = useCommunityCreate();
  const { community: editCommunity, loading: editLoading } = useCommunity(selectedCommunityId || undefined);

  const handleCreateCommunity = () => {
    setViewMode('create');
    setSelectedCommunityId(null);
  };

  const handleEditCommunity = (id: string) => {
    setSelectedCommunityId(id);
    setViewMode('edit');
  };

  const handleDeleteCommunity = (id: string) => {
    // TODO: Implement delete confirmation modal
    if (confirm('Are you sure you want to delete this community?')) {
      // TODO: Implement delete functionality
      console.log('Delete community:', id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        await createCommunity(data);
        alert('Community created successfully!');
        setViewMode('list');
      } else if (viewMode === 'edit' && selectedCommunityId) {
        // TODO: Implement update functionality
        console.log('Update community:', selectedCommunityId, data);
        alert('Community updated successfully!');
        setViewMode('list');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save community. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedCommunityId(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create New Community</h1>
              <p className="mt-1 text-sm text-gray-600">
                Set up a new community with custom governance settings
              </p>
            </div>
            <CommunityForm
              mode="create"
              loading={createLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        );

      case 'edit':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Community</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update community settings and configuration
              </p>
            </div>
            {editCommunity ? (
              <CommunityForm
                mode="edit"
                community={editCommunity}
                loading={editLoading}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading community...</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <CommunityList
            onCreateCommunity={handleCreateCommunity}
            onEditCommunity={handleEditCommunity}
            onDeleteCommunity={handleDeleteCommunity}
          />
        );
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
        
        {/* Error Display */}
        {createError && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-sm">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating community
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{createError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CommunitiesPage; 