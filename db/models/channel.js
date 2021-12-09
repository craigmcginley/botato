const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Channel', {
    discord_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'Channel'
  });
};
