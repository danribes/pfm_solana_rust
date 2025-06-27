const { sequelize, User } = require('../../../models');

describe('User Model Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('CRUD Operations', () => {
    test('should create a user', async () => {
      const userData = {
        wallet_address: 'TestWalletAddr00000000000000000000000000000001',
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
      };

      const user = await User.create(userData);
      expect(user.wallet_address).toBe(userData.wallet_address);
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.bio).toBe(userData.bio);
      expect(user.is_active).toBe(true);
      expect(user.id).toBeDefined();
    });

    test('should find a user by wallet address', async () => {
      const userData = {
        wallet_address: 'TestWalletAddr00000000000000000000000000000002',
        username: 'testuser2',
      };

      await User.create(userData);
      const foundUser = await User.findOne({ where: { wallet_address: userData.wallet_address } });
      expect(foundUser).toBeDefined();
      expect(foundUser.wallet_address).toBe(userData.wallet_address);
    });

    test('should update a user', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000003',
        username: 'testuser3',
      });

      await user.update({ bio: 'Updated bio' });
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.bio).toBe('Updated bio');
    });

    test('should delete a user', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000004',
        username: 'testuser4',
      });

      await user.destroy();
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Validation', () => {
    test('should require wallet_address', async () => {
      await expect(User.create({
        username: 'testuser',
      })).rejects.toThrow();
    });

    test('should validate email format', async () => {
      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000005',
        username: 'testuser5',
        email: 'invalid-email',
      })).rejects.toThrow();
    });

    test('should enforce unique wallet_address', async () => {
      const user1 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000006',
        username: 'testuser6',
      });

      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000006',
        username: 'testuser7',
      })).rejects.toThrow();

      await user1.destroy();
    });

    test('should enforce unique username', async () => {
      const user1 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000007',
        username: 'testuser8',
      });

      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000008',
        username: 'testuser8',
      })).rejects.toThrow();

      await user1.destroy();
    });
  });

  describe('Business Logic', () => {
    test('should set default values', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000009',
        username: 'testuser9',
      });

      expect(user.is_active).toBe(true);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    test('should update last_login_at', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000010',
        username: 'testuser10',
      });

      const loginTime = new Date();
      await user.update({ last_login_at: loginTime });
      
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.last_login_at).toEqual(loginTime);
    });
  });
}); 