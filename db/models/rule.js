const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Rule', {
    foreignServerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qualifierRoleId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    conjunction: {
      type: DataTypes.STRING,
    },
    conjunctionRoleId: {
      type: DataTypes.STRING,
    },
    resultAddRoleId: {
      type: DataTypes.STRING,
    },
    resultRemoveRoleId: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'Rule'
  });
}
