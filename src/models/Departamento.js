const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jefe_departamento_id: { // Nuevo campo para el ID del jefe del departamento
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser null si no hay jefe asignado
    references: {
      model: 'empleados', // Hace referencia a la tabla de empleados
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Si el empleado jefe es eliminado, el campo se establece en NULL
  },
}, {
  tableName: 'departamentos',
  timestamps: true,
});

module.exports = Departamento;