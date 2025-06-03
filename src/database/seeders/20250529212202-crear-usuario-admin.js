'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10); // Contraseña segura para el admin

    await queryInterface.bulkInsert('usuarios', [{ // Nombre de la tabla en español
      email: 'admin@empresa.com',
      contrasena: hashedPassword, // Campo en español
      rol: 'admin', // Campo en español
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};