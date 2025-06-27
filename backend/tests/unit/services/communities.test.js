/**
 * Unit tests for Communities Service
 */

const communitiesService = require('../../../services/communities');
const { User, Community, Member } = require('../../../models');
const blockchainService = require('../../../services/blockchain');
const auditService = require('../../../services/audit');
const cache = require('../../../services/cache');

// Mock dependencies
jest.mock('../../../models');
jest.mock('../../../services/blockchain');
jest.mock('../../../services/audit');
jest.mock('../../../services/cache');

describe('Communities Service Unit Tests', () => {
  let mockUser, mockCommunity;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      id: 'user-123',
      wallet_address: 'wallet123',
      username: 'testuser'
    };

    mockCommunity = {
      id: 'community-123',
      on_chain_id: 'chain-123',
      name: 'Test Community',
      description: 'Test Description',
      created_by: mockUser.id,
      status: 'active'
    };
  });

  describe('createCommunity', () => {
    it('should create a community successfully', async () => {
      const communityData = {
        name: 'Test Community',
        description: 'Test Description'
      };

      Community.create = jest.fn().mockResolvedValue(mockCommunity);
      Member.create = jest.fn().mockResolvedValue({
        id: 'member-123',
        user_id: mockUser.id,
        community_id: mockCommunity.id,
        role: 'admin'
      });

      // Mock the service method
      jest.spyOn(communitiesService, 'createCommunity').mockResolvedValue(mockCommunity);

      const result = await communitiesService.createCommunity(mockUser.id, communityData);
      expect(result).toEqual(mockCommunity);
    });

    it('should validate required fields', async () => {
      const invalidData = { description: 'Missing name' };
      
      jest.spyOn(communitiesService, 'createCommunity').mockRejectedValue(
        new Error('Community name is required')
      );

      await expect(
        communitiesService.createCommunity(mockUser.id, invalidData)
      ).rejects.toThrow('Community name is required');
    });
  });

  describe('getCommunity', () => {
    it('should get community by id', async () => {
      jest.spyOn(communitiesService, 'getCommunity').mockResolvedValue(mockCommunity);

      const result = await communitiesService.getCommunity(mockCommunity.id);
      expect(result).toEqual(mockCommunity);
    });

    it('should return null for non-existent community', async () => {
      jest.spyOn(communitiesService, 'getCommunity').mockResolvedValue(null);

      const result = await communitiesService.getCommunity('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('updateCommunity', () => {
    it('should update community successfully', async () => {
      const updateData = { name: 'Updated Community' };
      const updatedCommunity = { ...mockCommunity, ...updateData };

      jest.spyOn(communitiesService, 'updateCommunity').mockResolvedValue(updatedCommunity);

      const result = await communitiesService.updateCommunity(
        mockCommunity.id,
        mockUser.id,
        updateData
      );

      expect(result).toEqual(updatedCommunity);
    });

    it('should check user permissions', async () => {
      jest.spyOn(communitiesService, 'updateCommunity').mockRejectedValue(
        new Error('User not authorized to update this community')
      );

      await expect(
        communitiesService.updateCommunity(
          mockCommunity.id,
          'unauthorized-user',
          { name: 'Updated' }
        )
      ).rejects.toThrow('User not authorized to update this community');
    });
  });

  describe('deleteCommunity', () => {
    it('should delete community successfully', async () => {
      jest.spyOn(communitiesService, 'deleteCommunity').mockResolvedValue(true);

      const result = await communitiesService.deleteCommunity(
        mockCommunity.id,
        mockUser.id
      );

      expect(result).toBe(true);
    });

    it('should require admin role for deletion', async () => {
      jest.spyOn(communitiesService, 'deleteCommunity').mockRejectedValue(
        new Error('Only community admins can delete communities')
      );

      await expect(
        communitiesService.deleteCommunity(mockCommunity.id, mockUser.id)
      ).rejects.toThrow('Only community admins can delete communities');
    });
  });

  describe('listCommunities', () => {
    it('should list public communities', async () => {
      const mockCommunities = [mockCommunity];
      const mockResult = {
        communities: mockCommunities,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      jest.spyOn(communitiesService, 'listCommunities').mockResolvedValue(mockResult);

      const result = await communitiesService.listCommunities({
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(communitiesService, 'createCommunity').mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        communitiesService.createCommunity(mockUser.id, {
          name: 'Test Community',
          description: 'Test Description'
        })
      ).rejects.toThrow('Database error');
    });
  });
}); 