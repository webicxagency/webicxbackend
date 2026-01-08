'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PrimeGraphicsPayment extends Model {
    static associate(models) {
      PrimeGraphicsPayment.belongsTo(models.PrimeGraphicsInvoice, { foreignKey: 'invoice_id', as: 'invoice' });
    }
  }
  PrimeGraphicsPayment.init({
    invoice_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10, 2),
    provider: {
      type: DataTypes.STRING,
      defaultValue: 'paystack'
    },
    reference: DataTypes.STRING,
    status: DataTypes.STRING,
    paid_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PrimeGraphicsPayment',
  });
  return PrimeGraphicsPayment;
};