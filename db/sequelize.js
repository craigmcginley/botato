const Sequelize = require('sequelize');
const { databaseUrl } = require('../variables.js');
const { CHANNEL_TYPES } = require('../constants.js');

const sequelize = new Sequelize(databaseUrl, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// For use locally, without ssl cause lazy
// const sequelize = new Sequelize(databaseUrl);

const modelDefiners = [
  require('./models/guild.js'),
  require('./models/channel.js'),
  require('./models/role.js'),
  require('./models/member.js'),
];

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

const { Guild, Channel, Role, Member } = sequelize.models;

// create relationships for models
Guild.hasMany(Channel);
Guild.hasMany(Role);
Guild.hasMany(Member);
Channel.belongsTo(Guild);
Role.belongsTo(Guild);
Member.belongsTo(Guild);

// Nuke everything, reset to model schemas
// sequelize.sync({ force: true });

module.exports = sequelize;
