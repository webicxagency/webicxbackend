'use strict';

const { User } = require('../models');

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.create({
      email: 'foliremedy50@gmail.com',
      password: 'admin123',
      role: 'PRIMEGRAPHICS_ADMIN',
      firstName: 'Demo',
      lastName: 'User',
      isActive: true
    });
  },

  async down (queryInterface, Sequelize) {
    await User.destroy({
      where: { email: 'foliremedy50@gmail.com' }
    });
  }
};