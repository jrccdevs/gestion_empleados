// tu-proyecto-backend/api/index.js

// **1. Importaciones:**
// No necesitas dotenv.config() aquí, Vercel gestionará las variables de entorno desde su panel.
// require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Solo para desarrollo local si lo necesitas

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');       // Middleware de seguridad
const compression = require('compression'); // Middleware de compresión Gzip

// **IMPORTANTE SOBRE LA BASE DE DATOS:**
// La sincronización de la base de datos (syncDatabase) no debe ejecutarse en cada invocación de la función serverless.
// Se asume que tu esquema de base de datos en Alwaysdata ya está configurado.
// Si necesitas ejecutar migraciones, hazlo manualmente o como un paso de build separado en Vercel.
// Por lo tanto, comentamos o eliminamos la importación y la llamada a syncDatabase aquí:
// const { syncDatabase } = require('../src/models'); 

// **2. Importar tus rutas:**
// Ajusta las rutas relativas. Ahora estás en `api/index.js`, así que las rutas están un nivel arriba (`../`).
const authRoutes = require('../src/routes/authRoutes');
const departamentoRoutes = require('../src/routes/departamentoRoutes');
const empleadoRoutes = require('../src/routes/empleadoRoutes');

const app = express();

// **3. Configuración de CORS:**
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
// Es una buena práctica diferenciar entre desarrollo y producción.
// En Vercel, `process.env.NODE_ENV` será `production` por defecto.
if (process.env.NODE_ENV === 'development') {
    app.use(cors()); // En desarrollo local, permite todas las peticiones desde cualquier origen
} else {
    app.use(cors(corsOptions)); // En producción, solo permite peticiones desde tu frontend desplegado
}


// **4. Middlewares de Producción (Agregados):**
// Estos son recomendados para cualquier API en producción para seguridad y rendimiento.
app.use(helmet());      // Ayuda a asegurar tus encabezados HTTP
app.use(compression()); // Comprime las respuestas para un envío más rápido

// **5. Middlewares Existentes:**
app.use(express.json()); // Para parsear el cuerpo de las peticiones como JSON

// **6. Rutas de API:**
// Mantienen los mismos prefijos /api.
app.use('/api/auth', authRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/empleados', empleadoRoutes);

// **7. Rutas de Prueba/Raíz:**
// La ruta `/` responderá a la raíz de tu API (ej. `https://tu-backend.vercel.app/`).
// La ruta `/api/health` es útil para verificar que tu API está viva.
app.get('/', (req, res) => {
  res.send('API RESTful de Gestión de Empleados funcionando en Vercel!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});


// **8. Manejo de Errores Global:**
// Mantén tu middleware de manejo de errores.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || '¡Algo salió mal!', error: err.stack });
});

// **9. ¡EL CAMBIO MÁS IMPORTANTE PARA VERCEL!**
// Exporta la instancia de la aplicación Express.
// Vercel la importará y la ejecutará como una función serverless.
module.exports = app;

// **10. Eliminar `app.listen` y `startServer`:**
// NO INCLUYAS la lógica de `app.listen()` o `startServer()` aquí.
// Vercel se encarga de iniciar y detener tu aplicación automáticamente.
// Elimina todo el bloque `const startServer = async () => { ... }` y la llamada `startServer();`.