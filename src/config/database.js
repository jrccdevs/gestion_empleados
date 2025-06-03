const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cambia de config.json a config.js
const env = process.env.NODE_ENV || 'development';
const config = require('./config.js')[env]; // <--- ¡Asegúrate de que esto apunte a config.js!

// Estas líneas ahora son redundantes si config.js ya las está leyendo de process.env,
// pero no hacen daño si las dejas. Lo importante es que config.js las lea bien.
// config.username = process.env.DB_USER;
// config.password = process.env.DB_PASSWORD;
// config.database = process.env.DB_NAME;
// config.host = process.env.DB_HOST;
// config.port = process.env.DB_PORT;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false,
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
});

module.exports = sequelize;