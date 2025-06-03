const { Departamento } = require('../models');

// Crear un nuevo departamento
exports.crearDepartamento = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del departamento es requerido.' });
    }

    // Verificar si el departamento ya existe
    const departamentoExistente = await Departamento.findOne({ where: { nombre } });
    if (departamentoExistente) {
      return res.status(409).json({ message: 'Ya existe un departamento con este nombre.' });
    }

    const nuevoDepartamento = await Departamento.create({ nombre, descripcion });
    res.status(201).json({
      message: 'Departamento creado exitosamente.',
      departamento: nuevoDepartamento,
    });
  } catch (error) {
    console.error('Error al crear departamento:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Obtener todos los departamentos
exports.obtenerDepartamentos = async (req, res) => {
  try {
    const departamentos = await Departamento.findAll();
    res.status(200).json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Obtener un departamento por ID
exports.obtenerDepartamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await Departamento.findByPk(id);

    if (!departamento) {
      return res.status(404).json({ message: 'Departamento no encontrado.' });
    }

    res.status(200).json(departamento);
  } catch (error) {
    console.error('Error al obtener departamento por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Actualizar un departamento (modificado para permitir asignar/desasignar jefe)
exports.actualizarDepartamento = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, jefe_departamento_id } = req.body; // Añadir jefe_departamento_id
  
      const departamento = await Departamento.findByPk(id);
      if (!departamento) {
        return res.status(404).json({ message: 'Departamento no encontrado.' });
      }
  
      // Validaciones para el nombre (si se actualiza)
      if (nombre && nombre !== departamento.nombre) {
        const departamentoExistente = await Departamento.findOne({ where: { nombre } });
        if (departamentoExistente) {
          return res.status(409).json({ message: 'Ya existe otro departamento con este nombre.' });
        }
        departamento.nombre = nombre;
      }
  
      departamento.descripcion = descripcion !== undefined ? descripcion : departamento.descripcion; // Permite null
  
      // Lógica para asignar/desasignar jefe
      if (jefe_departamento_id !== undefined) { // Si se proporciona el campo
        if (jefe_departamento_id === null) {
          // Desasignar jefe
          departamento.jefe_departamento_id = null;
        } else {
          // Asignar un nuevo jefe
          const empleadoJefe = await Empleado.findByPk(jefe_departamento_id);
          if (!empleadoJefe) {
            return res.status(404).json({ message: 'El empleado especificado como jefe no existe.' });
          }
  
          // Regla 1: El jefe debe ser un empleado del mismo departamento.
          if (empleadoJefe.departamento_id !== parseInt(id)) {
              return res.status(400).json({ message: 'El jefe debe pertenecer al departamento al que se le asigna.' });
          }
  
          // Regla 2: Un empleado no puede ser jefe de más de un departamento.
          const departamentoConJefeExistente = await Departamento.findOne({
              where: { jefe_departamento_id: jefe_departamento_id, id: { [Op.ne]: id } }
          });
          if (departamentoConJefeExistente) {
              return res.status(400).json({ message: `Este empleado ya es jefe del departamento: ${departamentoConJefeExistente.nombre}. Un empleado no puede ser jefe de más de un departamento.` });
          }
  
          departamento.jefe_departamento_id = jefe_departamento_id;
        }
      }
  
      await departamento.save();
  
      // Recargar el departamento con la información del jefe si se asignó
      const departamentoActualizado = await Departamento.findByPk(id, {
          include: [{ model: Empleado, as: 'jefe', attributes: ['id', 'nombre', 'apellido', 'email'] }]
      });
  
      res.status(200).json({
        message: 'Departamento actualizado exitosamente.',
        departamento: departamentoActualizado,
      });
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
  };

// Eliminar un departamento
exports.eliminarDepartamento = async (req, res) => {
  try {
    const { id } = req.params;

    const departamento = await Departamento.findByPk(id);
    if (!departamento) {
      return res.status(404).json({ message: 'Departamento no encontrado.' });
    }

    await departamento.destroy();
    res.status(200).json({ message: 'Departamento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};