const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    wallet_address: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
    },
    avatar_url: DataTypes.TEXT,
    bio: DataTypes.TEXT,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_login_at: DataTypes.DATE,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true,
    scopes: {
      active: {
        where: { is_active: true }
      },
      inactive: {
        where: { is_active: false }
      }
    },
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.updateLastLogin = async function(loginTime = new Date()) {
    this.last_login_at = loginTime;
    return await this.save();
  };

  User.prototype.isActive = function() {
    return this.is_active === true;
  };

  User.prototype.getProfile = function() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar_url: this.avatar_url,
      bio: this.bio,
      is_active: this.is_active,
      last_login_at: this.last_login_at,
      created_at: this.created_at
    };
  };

  // Class methods
  User.findActive = function() {
    return this.scope('active').findAll();
  };

  User.findByWalletAddress = function(walletAddress) {
    return this.findOne({ where: { wallet_address: walletAddress } });
  };

  User.findByUsername = function(username) {
    return this.findOne({ where: { username: username } });
  };

  User.getStats = async function() {
    const total = await this.count();
    const active = await this.scope('active').count();
    const inactive = await this.scope('inactive').count();
    return { total, active, inactive };
  };

  return User;
}; 