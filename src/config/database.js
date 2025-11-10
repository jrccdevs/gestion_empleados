//src/config/database.js
try {
  const testMysql2 = require('mysql2');
  console.log('✅ mysql2 se ha cargado correctamente en el entorno de Vercel.');
} catch (e) {
  console.error('❌ ERROR CRÍTICO: No se puede cargar mysql2:', e.message);
}

try {
  const testSequelize = require('sequelize');
  console.log('✅ sequelize se ha cargado correctamente en el entorno de Vercel.');
} catch (e) {
  console.error('❌ ERROR CRÍTICO: No se puede cargar sequelize:', e.message);
}

const { Sequelize } = require('sequelize');
require('dotenv').config(); 

// Inicializa Sequelize DIRECTAMENTE con process.env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // puerto por defecto si
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      // collate: 'utf8mb4_unicode_ci',
      ssl: process.env.DB_SSL ? { // Configuración SSL es 'true'
        rejectUnauthorized: false // Esto es común para bases de datos compartidas.
      } : false
    },
    pool: { // para serverless, ayuda a reutilizar conexiones
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;