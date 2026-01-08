'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PrimeGraphicsInvoice extends Model {
    static associate(models) {
      PrimeGraphicsInvoice.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
      PrimeGraphicsInvoice.hasMany(models.PrimeGraphicsPayment, { foreignKey: 'invoice_id', as: 'payments' });
    }
  }
  PrimeGraphicsInvoice.init({
    invoice_number: DataTypes.STRING,
    client_id: DataTypes.INTEGER,
    services: DataTypes.TEXT,
    subtotal: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),
    tax: DataTypes.DECIMAL(10, 2),
    total: DataTypes.DECIMAL(10, 2),
    status: {
      type: DataTypes.ENUM,
      values: ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']
    },
    due_date: DataTypes.DATE,
    pdf_url: DataTypes.STRING,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PrimeGraphicsInvoice',
  });
  return PrimeGraphicsInvoice;
};