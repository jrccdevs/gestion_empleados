require('dotenv').config(); // Asegúrate de que dotenv esté cargado al inicio de este archivo

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    seederStorage: 'sequelize',
    // Rutas relativas desde el archivo config.js
    'models-path': '../models',
    'migrations-path': '../database/migrations',
    'seeders-path': '../database/seeders',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'gestion_empleados_db', // Puedes definir un nombre de DB para test
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    seederStorage: 'sequelize',
    'models-path': '../models',
    'migrations-path': '../database/migrations',
    'seeders-path': '../database/seeders',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    seederStorage: 'sequelize',
    'models-path': '../models',
    'migrations-path': '../database/migrations',
    'seeders-path': '../database/seeders',
  },
};