'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Document.init({
    companyId: DataTypes.INTEGER,
    projectId: DataTypes.INTEGER,
    leadId: DataTypes.INTEGER,
    templateId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    version: DataTypes.INTEGER,
    status: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    checksum: DataTypes.STRING,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};