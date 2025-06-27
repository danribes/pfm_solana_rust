const { User } = require('../../models');
const { v4: uuidv4 } = require('uuid');

const sampleUsers = [
  {
    id: uuidv4(),
    wallet_address: 'SoLanaWalletAddr00000000000000000000000000000001',
    username: 'alice',
    email: 'alice@example.com',
    avatar_url: '',
    bio: 'Community admin',
    is_active: true,
  },
  {
    id: uuidv4(),
    wallet_address: 'SoLanaWalletAddr00000000000000000000000000000002',
    username: 'bob',
    email: 'bob@example.com',
    avatar_url: '',
    bio: 'Voting enthusiast',
    is_active: true,
  },
  {
    id: uuidv4(),
    wallet_address: 'SoLanaWalletAddr00000000000000000000000000000003',
    username: 'carol',
    email: 'carol@example.com',
    avatar_url: '',
    bio: 'Member and voter',
    is_active: true,
  },
];

async function seedUsers() {
  await User.bulkCreate(sampleUsers, { ignoreDuplicates: true });
  return sampleUsers;
}

module.exports = seedUsers; 