const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define('Empleado', { // Nombre del modelo: Empleado
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: { // Nombre del campo: nombre
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: { // Nombre del campo: apellido
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  telefono: { // Nombre del campo: telefono
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha_ingreso: { // Nombre del campo: fecha_ingreso
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  puesto: { // Nombre del campo: puesto
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: { // Nombre del campo: estado
    type: DataTypes.ENUM('activo', 'inactivo', 'en_vacaciones'),
    defaultValue: 'activo',
    allowNull: false,
  },
  // departamento_id y supervisor_id se manejarán en las relaciones
}, {
  tableName: 'empleados', // Nombre de la tabla en la DB: empleados
  timestamps: true,
});

module.exports = Empleado;