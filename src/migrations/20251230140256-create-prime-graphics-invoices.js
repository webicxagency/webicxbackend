'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('PrimeGraphicsInvoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_number: {
        type: Sequelize.STRING
      },
      client_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Clients',
          key: 'id'
        }
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2)
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2)
      },
      total: {
        type: Sequelize.DECIMAL(10, 2)
      },
      status: {
        type: Sequelize.ENUM,
        values: ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']
      },
      due_date: {
        type: Sequelize.DATE
      },
      pdf_url: {
        type: Sequelize.STRING
      },
      created_at: {
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
    await queryInterface.dropTable('PrimeGraphicsInvoices');
  }
};
