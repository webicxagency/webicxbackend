'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentSignature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DocumentSignature.init({
    documentId: DataTypes.INTEGER,
    signedByType: DataTypes.STRING,
    signedById: DataTypes.INTEGER,
    signedAt: DataTypes.DATE,
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DocumentSignature',
  });
  return DocumentSignature;
};