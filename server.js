// src/app.js (principal del backend)
require('dotenv').config();
const express = require('express');
const { syncDatabase } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const departamentoRoutes = require('./src/routes/departamentoRoutes');
const empleadoRoutes = require('./src/routes/empleadoRoutes');
const cors = require('cors'); //Importar el paquete CORS

// Swagger
//const swaggerUi = require('swagger-ui-express');
//const swaggerSpecs = require('./src/swaggerConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE CORS ---
const corsOptions = {
  origin: ['http://localhost:4001', 'https://front-empleados-phi.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// Middlewares existentes
app.use(express.json());

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/empleados', empleadoRoutes);

// Ruta de documentación Swagger
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API RESTful de Gestión de Empleados funcionando! Accede a /api-docs para la documentación.');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || '¡Algo salió mal!', error: err.stack });
});

// Iniciar servidor y sincronizar base de datos
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV}`);
    console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
  });
};

startServer();
