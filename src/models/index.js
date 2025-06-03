const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Departamento = require('./Departamento');
const Empleado = require('./Empleado');

// Definir relaciones
Empleado.belongsTo(Departamento, {
  foreignKey: 'departamento_id',
  as: 'departamento',
});
Departamento.hasMany(Empleado, {
  foreignKey: 'departamento_id',
  as: 'empleados',
});

// Relación para el jefe de departamento
Departamento.belongsTo(Empleado, {
  as: 'jefe', // Alias para acceder al jefe
  foreignKey: 'jefe_departamento_id',
  constraints: false // Desactivar constraints para evitar ciclos en migraciones si hay referencias cruzadas iniciales
});
// Opcional: También se puede definir una relación inversa si se necesita desde Empleado
Empleado.hasOne(Departamento, {
    as: 'departamento_liderado',
    foreignKey: 'jefe_departamento_id'
});


// Relación recursiva para supervisor/subordinados
Empleado.belongsTo(Empleado, {
  as: 'supervisor',
  foreignKey: 'supervisor_id',
});
Empleado.hasMany(Empleado, {
  as: 'subordinados',
  foreignKey: 'supervisor_id',
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');
    // Usar alter: true es clave aquí para que Sequelize añada la nueva columna sin borrar la tabla
    await sequelize.sync({ alter: true });
    console.log('Todos los modelos fueron sincronizados exitosamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

module.exports = {
  sequelize,
  Usuario,
  Departamento,
  Empleado,
  syncDatabase,
};