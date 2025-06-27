const { Member } = require('../../models');
const { v4: uuidv4 } = require('uuid');

const sampleMembers = (userIds, communityIds) => [
  {
    id: uuidv4(),
    user_id: userIds[0],
    community_id: communityIds[0],
    role: 'admin',
    status: 'approved',
  },
  {
    id: uuidv4(),
    user_id: userIds[1],
    community_id: communityIds[0],
    role: 'member',
    status: 'approved',
  },
  {
    id: uuidv4(),
    user_id: userIds[2],
    community_id: communityIds[0],
    role: 'member',
    status: 'pending',
  },
  {
    id: uuidv4(),
    user_id: userIds[1],
    community_id: communityIds[1],
    role: 'admin',
    status: 'approved',
  },
  {
    id: uuidv4(),
    user_id: userIds[2],
    community_id: communityIds[1],
    role: 'member',
    status: 'approved',
  },
];

async function seedMembers(userIds, communityIds) {
  const members = sampleMembers(userIds, communityIds);
  await Member.bulkCreate(members, { ignoreDuplicates: true });
  return members;
}

module.exports = seedMembers; 