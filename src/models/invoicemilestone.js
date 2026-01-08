'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceMilestone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InvoiceMilestone.init({
    invoiceId: DataTypes.INTEGER,
    milestoneIndex: DataTypes.INTEGER,
    percentage: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    paystackReference: DataTypes.STRING,
    paidAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'InvoiceMilestone',
  });
  return InvoiceMilestone;
};