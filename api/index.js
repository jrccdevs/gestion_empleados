//api/index.js


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');       // Middleware de seguridad
const compression = require('compression'); // Middleware de compresión Gzip

const authRoutes = require('../src/routes/authRoutes');
const departamentoRoutes = require('../src/routes/departamentoRoutes');
const empleadoRoutes = require('../src/routes/empleadoRoutes');

const app = express();

// La URL del frontend se obtendrá de las variables de entorno que configurarás en el panel de Vercel.
const frontendProdUrl = process.env.FRONTEND_URL; 

// Opciones de CORS para producción
const corsOptions = {
  origin: frontendProdUrl,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// **Aplicar CORS:**

if (process.env.NODE_ENV === 'development') {
    app.use(cors()); // En desarrollo local, permite todas las peticiones desde cualquier origen
} else {
    app.use(cors(corsOptions)); // En producción, solo permite peticiones desde tu frontend desplegado
}


// Middlewares de Producción (Agregados):**
// Estos son recomendados para cualquier API en producción para seguridad y rendimiento.
app.use(helmet());      // Ayuda a asegurar tus encabezados HTTP
app.use(compression()); // Comprime las respuestas para un envío más rápido

// Middlewares Existentes:**
app.use(express.json()); // Para parsear el cuerpo de las peticiones como JSON

// Rutas de API:**
// Mantienen los mismos prefijos /api.
app.use('/api/auth', authRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/empleados', empleadoRoutes);

// Rutas de Prueba/Raíz:**

app.get('/', (req, res) => {
  res.send('API RESTful de Gestión de Empleados funcionando en Vercel!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});


// Manejo de Errores Global:**

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || '¡Algo salió mal!', error: err.stack });
});

module.exports = app;
