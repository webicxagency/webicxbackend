'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('PrimeGraphicsPayments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'PrimeGraphicsInvoices',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      provider: {
        type: Sequelize.STRING,
        defaultValue: 'paystack'
      },
      reference: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      paid_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('PrimeGraphicsPayments');
  }
};
