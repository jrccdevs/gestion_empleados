// empleados-api/src/models/index.js

const sequelize = require('../config/database');
// No necesitas DataTypes aquí si ya están siendo usadas en cada archivo de modelo al definir el modelo

// Importar los modelos ya definidos y conectados a la instancia de Sequelize
const Usuario = require('./Usuario');
const Departamento = require('./Departamento');
const Empleado = require('./Empleado');

// --- Definir Relaciones ---
// Asegúrate de que los modelos estén definidos antes de intentar crear las asociaciones.
// Las asociaciones se definen en el modelo principal (index.js) o dentro de los propios archivos de modelo si cada modelo tiene su propio archivo .associate.
// Dado tu configuración, definirlas aquí en index.js es lo apropiado.

// Empleado pertenece a un Departamento
Empleado.belongsTo(Departamento, {
  foreignKey: 'departamento_id',
  as: 'departamento',
});

// Un Departamento tiene muchos Empleados
Departamento.hasMany(Empleado, {
  foreignKey: 'departamento_id',
  as: 'empleados',
});

// Relación para el jefe de departamento
// Un Departamento pertenece a un Empleado (el jefe)
Departamento.belongsTo(Empleado, {
  as: 'jefe', // Alias para acceder al jefe
  foreignKey: 'jefe_departamento_id',
  constraints: false // Desactivar constraints para evitar ciclos en migraciones si hay referencias cruzadas iniciales
});

// Opcional: Relación inversa desde Empleado para saber qué departamento lidera
// Un Empleado puede liderar un Departamento
Empleado.hasOne(Departamento, {
  as: 'departamento_liderado',
  foreignKey: 'jefe_departamento_id'
});

// Relación recursiva para supervisor/subordinados de Empleado
// Un Empleado tiene un supervisor (que es otro Empleado)
Empleado.belongsTo(Empleado, {
  as: 'supervisor',
  foreignKey: 'supervisor_id',
});

// Un Empleado tiene muchos subordinados (que son otros Empleados)
Empleado.hasMany(Empleado, {
  as: 'subordinados',
  foreignKey: 'supervisor_id',
});

// --- Función para Sincronizar la Base de Datos ---
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');
    // Usar alter: true es clave aquí para que Sequelize añada la nueva columna sin borrar la tabla
    //await sequelize.sync({ alter: true });
    //console.log('Todos los modelos fueron sincronizados exitosamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

// --- Exportar los Modelos y la Instancia de Sequelize ---
module.exports = {
  sequelize,
  Usuario,
  Departamento,
  Empleado,
  syncDatabase,
};