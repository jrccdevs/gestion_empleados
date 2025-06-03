'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empleados', { // Nombre de tabla
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: { // Nombre de campo
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido: { // Nombre de campo
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      telefono: { // Nombre de campo
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_ingreso: { // Nombre de campo
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      puesto: { // Nombre de campo
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: { // Nombre de campo
        type: Sequelize.ENUM('activo', 'inactivo', 'en_vacaciones'),
        defaultValue: 'activo',
        allowNull: false
      },
      departamento_id: { // Foreign Key en español
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departamentos', // Nombre de la tabla a la que se hace referencia
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      supervisor_id: { // Foreign Key en español para recursividad
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'empleados', // Referencia a la misma tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empleados');
  }
};