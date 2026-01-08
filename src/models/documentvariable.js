'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentVariable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DocumentVariable.init({
    documentId: DataTypes.INTEGER,
    variables: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'DocumentVariable',
  });
  return DocumentVariable;
};