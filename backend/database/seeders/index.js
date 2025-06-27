const seedUsers = require('./users');
const seedCommunities = require('./communities');
const seedMembers = require('./members');
const seedVoting = require('./voting');
const { sequelize } = require('../../models');

async function runSeeders(env = 'development') {
  try {
    await sequelize.sync();
    const users = await seedUsers();
    const userIds = users.map(u => u.id);
    const communities = await seedCommunities(userIds);
    const communityIds = communities.map(c => c.id);
    await seedMembers(userIds, communityIds);
    await seedVoting(communityIds, userIds);
    // Add more seeders as needed for analytics, sessions, etc.
    console.log(`Seeding completed for environment: ${env}`);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  const env = process.env.NODE_ENV || 'development';
  runSeeders(env);
}

module.exports = runSeeders; 