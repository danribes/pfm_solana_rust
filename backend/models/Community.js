const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Community = sequelize.define('Community', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    on_chain_id: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    logo_url: DataTypes.TEXT,
    banner_url: DataTypes.TEXT,
    website_url: DataTypes.TEXT,
    discord_url: DataTypes.TEXT,
    twitter_url: DataTypes.TEXT,
    github_url: DataTypes.TEXT,
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    member_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    require_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_public_voting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    max_members: DataTypes.INTEGER,
    voting_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'communities',
    timestamps: false,
    underscored: true,
    scopes: {
      active: {
        where: { is_active: true }
      },
      inactive: {
        where: { is_active: false }
      },
      withCreator: {
        include: [{
          model: sequelize.models.User,
          as: 'User',
          attributes: ['id', 'username', 'wallet_address']
        }]
      }
    },
    hooks: {
      afterCreate: async (community) => {
        // Update member count when community is created
        await community.update({ member_count: 1 });
      }
    }
  });

  // Instance methods
  Community.prototype.isActive = function() {
    return this.is_active === true;
  };

  Community.prototype.getStats = function() {
    return {
      id: this.id,
      name: this.name,
      member_count: this.member_count,
      is_active: this.is_active,
      created_at: this.created_at
    };
  };

  Community.prototype.getSummary = function() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      member_count: this.member_count,
      is_active: this.is_active,
      created_at: this.created_at
    };
  };

  Community.prototype.updateMemberCount = async function() {
    const { Member } = require('./index');
    const count = await Member.count({
      where: {
        community_id: this.id,
        status: 'approved'
      }
    });
    await this.update({ member_count: count });
    return count;
  };

  Community.prototype.incrementMemberCount = async function() {
    await this.increment('member_count');
    await this.reload();
  };

  Community.prototype.decrementMemberCount = async function() {
    if (this.member_count > 0) {
      await this.decrement('member_count');
      await this.reload();
    }
  };

  Community.prototype.isUserMember = async function(userId) {
    const { Member } = require('./index');
    const member = await Member.findOne({
      where: {
        community_id: this.id,
        user_id: userId,
        status: 'approved'
      }
    });
    return !!member;
  };

  // Class methods
  Community.findActive = function() {
    return this.scope('active').findAll();
  };

  Community.findByName = function(name) {
    return this.findOne({ where: { name: name } });
  };

  Community.search = function(query) {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.iLike]: `%${query}%` } },
          { description: { [sequelize.Op.iLike]: `%${query}%` } }
        ]
      }
    });
  };

  Community.getStats = async function() {
    const total = await this.count();
    const active = await this.scope('active').count();
    const inactive = await this.scope('inactive').count();
    return { total, active, inactive };
  };

  Community.findByCreator = function(creatorId) {
    return this.findAll({
      where: { created_by: creatorId }
    });
  };

  // Additional methods for tests
  Community.prototype.getSummary = function() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      member_count: this.member_count,
      is_active: this.is_active,
      created_at: this.created_at
    };
  };

  Community.prototype.incrementMemberCount = async function() {
    await this.increment('member_count');
    await this.reload();
  };

  Community.prototype.decrementMemberCount = async function() {
    if (this.member_count > 0) {
      await this.decrement('member_count');
      await this.reload();
    }
  };

  Community.prototype.isUserMember = async function(userId) {
    const { Member } = require('./index');
    const member = await Member.findOne({
      where: {
        community_id: this.id,
        user_id: userId,
        status: 'approved'
      }
    });
    return !!member;
  };

  Community.findActive = function() {
    return this.scope('active').findAll();
  };

  Community.findByName = function(name) {
    return this.findOne({ where: { name: name } });
  };

  return Community;
}; 