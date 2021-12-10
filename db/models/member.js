const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Member', {
    discord_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'Member'
  });
};
