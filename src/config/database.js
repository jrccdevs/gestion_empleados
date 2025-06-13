// tu-proyecto-backend/src/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Puedes dejarla o comentarla, Vercel la ignora en producción

// Inicializa Sequelize DIRECTAMENTE con process.env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Añade un puerto por defecto si no siempre lo configuras
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      // collate: 'utf8mb4_unicode_ci',
      ssl: process.env.DB_SSL ? { // Configuración SSL si tu DB lo requiere y si DB_SSL es 'true'
        rejectUnauthorized: false // Esto es común para bases de datos compartidas. ¡Usar con precaución!
      } : false
    },
    pool: { // Esto es importante para serverless, ayuda a reutilizar conexiones
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;