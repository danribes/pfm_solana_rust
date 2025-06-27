const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VotingQuestion = sequelize.define('VotingQuestion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    on_chain_id: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
    },
    community_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    question_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'single_choice',
      validate: {
        isIn: [['single_choice', 'multiple_choice', 'ranked_choice']],
      },
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    voting_start_at: DataTypes.DATE,
    voting_end_at: DataTypes.DATE,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    total_votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    allow_anonymous_voting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    require_member_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    min_votes_required: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'voting_questions',
    timestamps: false,
    underscored: true,
  });
  return VotingQuestion;
}; 