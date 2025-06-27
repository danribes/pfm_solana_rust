const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Analytics = sequelize.define('Analytics', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    event_data: DataTypes.JSONB,
    user_id: DataTypes.UUID,
    community_id: DataTypes.UUID,
    question_id: DataTypes.UUID,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ip_address: DataTypes.INET,
    user_agent: DataTypes.TEXT,
  }, {
    tableName: 'analytics',
    timestamps: false,
    underscored: true,
  });
  return Analytics;
}; 