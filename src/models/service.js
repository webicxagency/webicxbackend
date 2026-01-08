'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      // define association here
    }
  }
  Service.init({
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Service',
  });
  return Service;
};