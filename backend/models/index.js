const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Create Sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false, // Disable logging for tests
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Import models
const User = require('./User')(sequelize, Sequelize);
const Community = require('./Community')(sequelize, Sequelize);
const Member = require('./Member')(sequelize, Sequelize);
const VotingQuestion = require('./VotingQuestion')(sequelize, Sequelize);
const Vote = require('./Vote')(sequelize, Sequelize);
const Session = require('./Session')(sequelize, Sequelize);
const Analytics = require('./Analytics')(sequelize, Sequelize);

// Define associations
User.hasMany(Community, { foreignKey: 'created_by', as: 'CreatedCommunities' });
Community.belongsTo(User, { foreignKey: 'created_by', as: 'User' });

User.hasMany(Member, { foreignKey: 'user_id', as: 'Memberships' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Community.hasMany(Member, { foreignKey: 'community_id', as: 'Members' });
Member.belongsTo(Community, { foreignKey: 'community_id', as: 'Community' });

Community.hasMany(VotingQuestion, { foreignKey: 'community_id', as: 'VotingQuestions' });
VotingQuestion.belongsTo(Community, { foreignKey: 'community_id', as: 'Community' });

User.hasMany(VotingQuestion, { foreignKey: 'created_by', as: 'CreatedQuestions' });
VotingQuestion.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

VotingQuestion.hasMany(Vote, { foreignKey: 'question_id', as: 'Votes' });
Vote.belongsTo(VotingQuestion, { foreignKey: 'question_id', as: 'VotingQuestion' });

User.hasMany(Vote, { foreignKey: 'user_id', as: 'Votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasMany(Session, { foreignKey: 'user_id', as: 'Sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Analytics associations
User.hasMany(Analytics, { foreignKey: 'user_id', as: 'Analytics' });
Analytics.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Community.hasMany(Analytics, { foreignKey: 'community_id', as: 'Analytics' });
Analytics.belongsTo(Community, { foreignKey: 'community_id', as: 'Community' });

VotingQuestion.hasMany(Analytics, { foreignKey: 'question_id', as: 'Analytics' });
Analytics.belongsTo(VotingQuestion, { foreignKey: 'question_id', as: 'Question' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Community,
  Member,
  VotingQuestion,
  Vote,
  Session,
  Analytics,
}; 