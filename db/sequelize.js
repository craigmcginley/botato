const Sequelize = require('sequelize');
const { databaseUrl } = require('../variables.js');
const { CHANNEL_TYPES } = require('../constants.js');

let sequelize = null;


if (process.env.PRODUCTION) {
  equelize = new Sequelize(databaseUrl, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // For use locally, without ssl cause lazy
  sequelize = new Sequelize(databaseUrl);
}

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

sequelize.sync();

module.exports = sequelize;
