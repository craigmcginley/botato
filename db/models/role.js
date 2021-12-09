const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Role', {
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
    tableName: 'Role'
  });
}
