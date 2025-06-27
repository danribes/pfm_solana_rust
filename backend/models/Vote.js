const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    selected_options: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    voted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    transaction_signature: DataTypes.STRING(88),
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'votes',
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['question_id', 'user_id'] },
    ],
  });
  return Vote;
}; 