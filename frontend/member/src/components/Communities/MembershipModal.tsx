import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Community } from '../../types/community';
import { useMembership } from '../../hooks/useCommunities';

interface MembershipModalProps {
  community: Community;
  onClose: () => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ community, onClose }) => {
  const [message, setMessage] = useState('');
  const { joinCommunity, loading } = useMembership(community.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinCommunity(message);
      onClose();
    } catch (error) {
      console.error('Failed to join community:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Join {community.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell the community why you'd like to join..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Submitting...' : 'Request to Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipModal; 