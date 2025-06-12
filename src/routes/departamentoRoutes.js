const express = require('express');
const {
  crearDepartamento,
  obtenerDepartamentos,
  obtenerDepartamentoPorId,
  actualizarDepartamento, // Esta función manejará la asignación de jefe
  eliminarDepartamento,
} = require('../controllers/departamentoController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { Departamento, Empleado } = require('../models'); // Importar Empleado para la inclusión

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), crearDepartamento);
router.put('/:id', authorize('admin'), actualizarDepartamento);
router.delete('/:id', authorize('admin'), eliminarDepartamento);

// Obtener todos los departamentos, incluir la información del jefe
router.get('/', async (req, res, next) => {
  try {
    const departamentos = await Departamento.findAll({
      include: [{ model: Empleado, as: 'jefe', attributes: ['id', 'nombre', 'apellido', 'email'] }]
    });
    res.status(200).json(departamentos);
  } catch (error) {
    next(error); // Pasa el error al middleware de errores global
  }
});

// Obtener un departamento por ID, incluir la información del jefe
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const departamento = await Departamento.findByPk(id, {
            include: [{ model: Empleado, as: 'jefe', attributes: ['id', 'nombre', 'apellido', 'email'] }]
        });

        if (!departamento) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }
        res.status(200).json(departamento);
    } catch (error) {
        next(error);
    }
});


module.exports = router;