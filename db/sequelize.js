const Sequelize = require('sequelize');
const { databaseUrl } = require('../variables.js');
const { CHANNEL_TYPES } = require('../constants.js');

const sequelize = new Sequelize(databaseUrl);

const modelDefiners = [
  require('./models/channel.js'),
  require('./models/guild.js'),
  require('./models/role.js'),
];

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

const { ChannelType, Channel, Guild, Role } = sequelize.models;

// create relationships for models
Guild.hasMany(Channel);
Guild.hasMany(Role);
Channel.belongsTo(Guild);
Role.belongsTo(Guild);

// Nuke everything, reset to model schemas
// sequelize.sync({ force: true });

module.exports = sequelize;
