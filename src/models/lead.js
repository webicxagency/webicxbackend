'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lead.init({
    companyId: DataTypes.INTEGER,
    clientName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.STRING,
    contractValue: DataTypes.DECIMAL,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Lead',
  });
  return Lead;
};