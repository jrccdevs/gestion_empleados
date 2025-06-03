const express = require('express');
const {
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerJerarquiaPorDepartamento, // Importar la nueva función
} = require('../controllers/empleadoController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), crearEmpleado);
router.put('/:id', authorize('admin'), actualizarEmpleado);
router.delete('/:id', authorize('admin'), eliminarEmpleado);

router.get('/', obtenerEmpleados);
router.get('/:id', obtenerEmpleadoPorId);

// Nueva ruta para el reporte jerárquico por departamento
router.get('/jerarquia/:departamentoId', obtenerJerarquiaPorDepartamento);

module.exports = router;