const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Guild', {
    discord_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'Guild'
  });
};
