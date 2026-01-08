'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DocumentTemplate.init({
    companyId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    bodyHtml: DataTypes.TEXT,
    variables: DataTypes.JSON,
    isActive: DataTypes.BOOLEAN,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DocumentTemplate',
  });
  return DocumentTemplate;
};