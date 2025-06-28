import React, { useState, useEffect } from 'react';
import type { 
  Community, 
  CreateCommunityRequest, 
  UpdateCommunityRequest, 
  CommunityFormData 
} from '../../types/community';

interface CommunityFormProps {
  community?: Community;
  loading?: boolean;
  onSubmit: (data: CreateCommunityRequest | UpdateCommunityRequest) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const CommunityForm: React.FC<CommunityFormProps> = ({
  community,
  loading = false,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    voting_threshold: 51,
    min_voting_period: 24,
    max_voting_period: 168, // 7 days
    require_member_approval: true,
    allow_public_voting: false,
    max_members: '',
    voting_quorum: 10,
    proposal_bond: 0.1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && community) {
      setFormData({
        name: community.name,
        description: community.description,
        voting_threshold: community.voting_threshold,
        min_voting_period: 24, // Default values as these aren't in Community type
        max_voting_period: 168,
        require_member_approval: true,
        allow_public_voting: false,
        max_members: '',
        voting_quorum: 10,
        proposal_bond: 0.1,
      });
    }
  }, [mode, community]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.voting_threshold < 1 || formData.voting_threshold > 100) {
      newErrors.voting_threshold = 'Voting threshold must be between 1 and 100';
    }

    if (formData.min_voting_period < 1) {
      newErrors.min_voting_period = 'Minimum voting period must be at least 1 hour';
    }

    if (formData.max_voting_period < formData.min_voting_period) {
      newErrors.max_voting_period = 'Maximum voting period must be greater than minimum';
    }

    if (formData.voting_quorum < 1 || formData.voting_quorum > 100) {
      newErrors.voting_quorum = 'Voting quorum must be between 1 and 100';
    }

    if (formData.proposal_bond < 0) {
      newErrors.proposal_bond = 'Proposal bond cannot be negative';
    }

    if (formData.max_members && parseInt(formData.max_members) < 1) {
      newErrors.max_members = 'Maximum members must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const configuration = {
      voting_threshold: formData.voting_threshold,
      min_voting_period: formData.min_voting_period,
      max_voting_period: formData.max_voting_period,
      require_member_approval: formData.require_member_approval,
      allow_public_voting: formData.allow_public_voting,
      max_members: formData.max_members ? parseInt(formData.max_members) : null,
      voting_quorum: formData.voting_quorum,
      proposal_bond: formData.proposal_bond,
    };

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      configuration,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    }
  };

  const updateField = <K extends keyof CommunityFormData>(
    field: K,
    value: CommunityFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Community Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Community Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter community name"
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your community's purpose and goals"
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Voting Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Voting Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voting Threshold */}
          <div>
            <label htmlFor="voting_threshold" className="block text-sm font-medium text-gray-700">
              Voting Threshold (%)
            </label>
            <input
              type="number"
              id="voting_threshold"
              min="1"
              max="100"
              value={formData.voting_threshold}
              onChange={(e) => updateField('voting_threshold', parseInt(e.target.value) || 0)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.voting_threshold ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.voting_threshold && (
              <p className="mt-1 text-sm text-red-600">{errors.voting_threshold}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Percentage of votes needed to pass a proposal
            </p>
          </div>

          {/* Voting Quorum */}
          <div>
            <label htmlFor="voting_quorum" className="block text-sm font-medium text-gray-700">
              Voting Quorum (%)
            </label>
            <input
              type="number"
              id="voting_quorum"
              min="1"
              max="100"
              value={formData.voting_quorum}
              onChange={(e) => updateField('voting_quorum', parseInt(e.target.value) || 0)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.voting_quorum ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.voting_quorum && (
              <p className="mt-1 text-sm text-red-600">{errors.voting_quorum}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Minimum participation required for valid vote
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Community' : 'Update Community'}
        </button>
      </div>
    </form>
  );
};

export default CommunityForm; 