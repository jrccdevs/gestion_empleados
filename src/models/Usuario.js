const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', { // Nombre del modelo: Usuario
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  contrasena: { // Nombre del campo: contrasena
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: { // Nombre del campo: rol
    type: DataTypes.ENUM('admin', 'empleado'),
    defaultValue: 'empleado',
    allowNull: false,
  }
}, {
  tableName: 'usuarios', // Nombre de la tabla en la DB: usuarios
  timestamps: true,
});

Usuario.beforeCreate(async (usuario) => {
  usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
});

Usuario.prototype.compararContrasena = async function (contrasenaCandidata) { // Nombre del método: compararContrasena
  return bcrypt.compare(contrasenaCandidata, this.contrasena);
};

module.exports = Usuario;