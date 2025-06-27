/**
 * Unit tests for Users Service
 */

const usersService = require('../../../services/users');
const { User, Member, Community } = require('../../../models');
const auditService = require('../../../services/audit');
const cache = require('../../../services/cache');

// Mock dependencies
jest.mock('../../../models');
jest.mock('../../../services/audit');
jest.mock('../../../services/cache');

describe('Users Service Unit Tests', () => {
  let mockUser, mockCommunity;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      id: 'user-123',
      wallet_address: 'wallet123',
      username: 'testuser',
      email: 'test@example.com',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockCommunity = {
      id: 'community-123',
      name: 'Test Community',
      status: 'active'
    };

    // Mock audit service
    auditService.logAuditEvent = jest.fn().mockResolvedValue(true);

    // Mock cache service
    cache.get = jest.fn().mockResolvedValue(null);
    cache.set = jest.fn().mockResolvedValue(true);
    cache.del = jest.fn().mockResolvedValue(true);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        wallet_address: 'wallet123',
        username: 'testuser',
        email: 'test@example.com'
      };

      User.create = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser);

      const result = await usersService.createUser(userData);
      expect(result).toEqual(mockUser);
    });

    it('should validate required fields', async () => {
      const invalidData = { username: 'testuser' }; // Missing wallet_address

      jest.spyOn(usersService, 'createUser').mockRejectedValue(
        new Error('Wallet address is required')
      );

      await expect(
        usersService.createUser(invalidData)
      ).rejects.toThrow('Wallet address is required');
    });

    it('should handle duplicate wallet address', async () => {
      const userData = {
        wallet_address: 'wallet123',
        username: 'testuser'
      };

      jest.spyOn(usersService, 'createUser').mockRejectedValue(
        new Error('User with this wallet address already exists')
      );

      await expect(
        usersService.createUser(userData)
      ).rejects.toThrow('User with this wallet address already exists');
    });
  });

  describe('getUserById', () => {
    it('should get user from cache if available', async () => {
      cache.get = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

      const result = await usersService.getUserById(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should get user from database if not cached', async () => {
      cache.get = jest.fn().mockResolvedValue(null);
      User.findByPk = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

      const result = await usersService.getUserById(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(null);

      const result = await usersService.getUserById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getUserByWalletAddress', () => {
    it('should get user by wallet address', async () => {
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'getUserByWalletAddress').mockResolvedValue(mockUser);

      const result = await usersService.getUserByWalletAddress(mockUser.wallet_address);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent wallet', async () => {
      jest.spyOn(usersService, 'getUserByWalletAddress').mockResolvedValue(null);

      const result = await usersService.getUserByWalletAddress('non-existent-wallet');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const updatedUser = { ...mockUser, ...updateData };
      jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);

      const result = await usersService.updateUser(mockUser.id, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should validate update data', async () => {
      const invalidData = { wallet_address: 'new-wallet' }; // Wallet address shouldn't be updatable

      jest.spyOn(usersService, 'updateUser').mockRejectedValue(
        new Error('Wallet address cannot be updated')
      );

      await expect(
        usersService.updateUser(mockUser.id, invalidData)
      ).rejects.toThrow('Wallet address cannot be updated');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      jest.spyOn(usersService, 'deleteUser').mockResolvedValue(true);

      const result = await usersService.deleteUser(mockUser.id);
      expect(result).toBe(true);
    });

    it('should handle non-existent user deletion', async () => {
      jest.spyOn(usersService, 'deleteUser').mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        usersService.deleteUser('non-existent')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserCommunities', () => {
    it('should get user communities', async () => {
      const mockMemberships = [
        {
          id: 'member-123',
          user_id: mockUser.id,
          community_id: mockCommunity.id,
          role: 'member',
          Community: mockCommunity
        }
      ];

      const mockResult = {
        memberships: mockMemberships,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      jest.spyOn(usersService, 'getUserCommunities').mockResolvedValue(mockResult);

      const result = await usersService.getUserCommunities(mockUser.id, {
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics', async () => {
      const mockStats = {
        communities_count: 3,
        votes_count: 15,
        questions_created: 5,
        account_age_days: 30,
        last_activity: new Date()
      };

      jest.spyOn(usersService, 'getUserStats').mockResolvedValue(mockStats);

      const result = await usersService.getUserStats(mockUser.id);
      expect(result).toEqual(mockStats);
    });
  });

  describe('searchUsers', () => {
    it('should search users by username', async () => {
      const mockUsers = [mockUser];
      const mockResult = {
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      jest.spyOn(usersService, 'searchUsers').mockResolvedValue(mockResult);

      const result = await usersService.searchUsers({
        query: 'testuser',
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });

    it('should handle empty search results', async () => {
      const mockResult = {
        users: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };

      jest.spyOn(usersService, 'searchUsers').mockResolvedValue(mockResult);

      const result = await usersService.searchUsers({
        query: 'nonexistent',
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const loginTime = new Date();
      const updatedUser = { ...mockUser, last_login_at: loginTime };

      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(updatedUser);

      const result = await usersService.updateLastLogin(mockUser.id);
      expect(result.last_login_at).toBeDefined();
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const activatedUser = { ...mockUser, status: 'active' };
      jest.spyOn(usersService, 'activateUser').mockResolvedValue(activatedUser);

      const result = await usersService.activateUser(mockUser.id);
      expect(result.status).toBe('active');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const deactivatedUser = { ...mockUser, status: 'inactive' };
      jest.spyOn(usersService, 'deactivateUser').mockResolvedValue(deactivatedUser);

      const result = await usersService.deactivateUser(mockUser.id);
      expect(result.status).toBe('inactive');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(usersService, 'createUser').mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(
        usersService.createUser({
          wallet_address: 'wallet123',
          username: 'testuser'
        })
      ).rejects.toThrow('Database connection error');
    });

    it('should handle cache errors gracefully', async () => {
      cache.get = jest.fn().mockRejectedValue(new Error('Cache error'));
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

      // Should still work even if cache fails
      const result = await usersService.getUserById(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });
}); 