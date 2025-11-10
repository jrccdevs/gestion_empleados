const express = require('express');
const {
  crearEmpleado,
  obtenerEmpleados, // Mantén esta función
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerJerarquiaPorDepartamento,
} = require('../controllers/empleadoController');
// No necesitas importar Empleado aquí si ya lo manejas en el controlador
// const { Empleado } = require('../models');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Aplica protección a todas las rutas que siguen

// Esta ruta manejará la obtención de empleados para todo (incluyendo el dropdown)

router.get('/', authorize(['admin', 'user']), obtenerEmpleados); // Aquí llamamos al controlador

router.post('/', authorize('admin'), crearEmpleado);
router.put('/:id', authorize('admin'), actualizarEmpleado);
router.delete('/:id', authorize('admin'), eliminarEmpleado);

router.get('/:id', obtenerEmpleadoPorId); // Ruta para obtener UN empleado por ID

// Nueva ruta para el reporte jerárquico por departamento
router.get('/jerarquia/:departamentoId', obtenerJerarquiaPorDepartamento);

module.exports = router;