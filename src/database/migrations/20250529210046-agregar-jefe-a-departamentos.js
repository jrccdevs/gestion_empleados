'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('departamentos', 'jefe_departamento_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'empleados',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('departamentos', 'jefe_departamento_id');
  }
};