const { Community } = require('../../models');
const { v4: uuidv4 } = require('uuid');

const sampleCommunities = (userIds) => [
  {
    id: uuidv4(),
    on_chain_id: 'CommunityChainAddr00000000000000000000000000000001',
    name: 'Solana DAO',
    description: 'A decentralized Solana community',
    created_by: userIds[0],
    is_active: true,
    require_approval: true,
    allow_public_voting: false,
    voting_threshold: 2,
  },
  {
    id: uuidv4(),
    on_chain_id: 'CommunityChainAddr00000000000000000000000000000002',
    name: 'Open Source Guild',
    description: 'Developers building open source tools',
    created_by: userIds[1],
    is_active: true,
    require_approval: false,
    allow_public_voting: true,
    voting_threshold: 1,
  },
];

async function seedCommunities(userIds) {
  const communities = sampleCommunities(userIds);
  await Community.bulkCreate(communities, { ignoreDuplicates: true });
  return communities;
}

module.exports = seedCommunities; 