const { Empleado, Departamento } = require('../models');
const { Op } = require('sequelize'); // Para operadores de Sequelize

// Crear un nuevo empleado
exports.crearEmpleado = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_ingreso,
      puesto,
      estado,
      departamento_id,
      supervisor_id, // Para el futuro reporte jerárquico
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fecha_ingreso || !puesto) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes: nombre, apellido, email, fecha de ingreso, puesto.' });
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido.' });
    }
    
    if (!/^[0-9]+$/.test(telefono)){
      return res.status(400).json({ message: 'Formato de telefono inválido.' });
    }
    // Verificar si el email ya existe
    const empleadoExistente = await Empleado.findOne({ where: { email } });
    if (empleadoExistente) {
      return res.status(409).json({ message: 'Ya existe un empleado con este email.' });
    }

    // Validar que el departamento_id sea válido si se proporciona
    if (departamento_id) {
      const departamento = await Departamento.findByPk(departamento_id);
      if (!departamento) {
        return res.status(404).json({ message: 'El ID de departamento proporcionado no existe.' });
      }
    }

    // Validar que el supervisor_id sea válido si se proporciona
    if (supervisor_id) {
        const supervisor = await Empleado.findByPk(supervisor_id);
        if (!supervisor) {
            return res.status(404).json({ message: 'El ID de supervisor proporcionado no existe.' });
        }
    }

    const nuevoEmpleado = await Empleado.create({
      nombre,
      apellido,
      email,
      telefono,
      fecha_ingreso,
      puesto,
      estado: estado || 'activo',
      departamento_id: departamento_id || null, // Permitir null si no se asigna en la creación
      supervisor_id: supervisor_id || null,
    });

    res.status(201).json({
      message: 'Empleado creado exitosamente.',
      empleado: nuevoEmpleado,
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Obtener todos los empleados con filtros y paginación
exports.obtenerEmpleados = async (req, res, next) => { // Añadir 'next' si lo usas para errores
  try {
    const {
      nombre,
      apellido,
      email,
      puesto,
      estado,
      departamento_id,
      fecha_ingreso_desde,
      fecha_ingreso_hasta,
      page = 1,
      limit = 10,
      select, // *** NUEVO: Capturar el parámetro 'select' ***
    } = req.query;

    const whereClause = {};
    const attributes = ['id', 'nombre', 'apellido', 'email']; // Atributos por defecto para el dropdown

    // Si 'select' es true, sobrescribir limit y offset para obtener todos,
    // y solo los atributos necesarios.
    let currentLimit = parseInt(limit);
    let currentOffset = (parseInt(page) - 1) * currentLimit;

    if (select === 'true') {
      currentLimit = null; // No hay límite, obtener todos
      currentOffset = 0;   // No hay offset
      // No necesitamos aplicar filtros complejos ni paginación para una lista simple
      // El `whereClause` vacío estará bien si no quieres filtrar por defecto en modo `select`
    } else {
      // Aplicar filtros solo si NO estamos en modo 'select'
      if (nombre) {
        whereClause.nombre = { [Op.like]: `%${nombre}%` };
      }
      if (apellido) {
        whereClause.apellido = { [Op.like]: `%${apellido}%` };
      }
      if (email) {
        whereClause.email = { [Op.like]: `%${email}%` };
      }
      if (puesto) {
        whereClause.puesto = { [Op.like]: `%${puesto}%` };
      }
      if (estado) {
        whereClause.estado = estado;
      }
      if (departamento_id) {
        whereClause.departamento_id = departamento_id;
      }
      if (fecha_ingreso_desde || fecha_ingreso_hasta) {
        whereClause.fecha_ingreso = {};
        if (fecha_ingreso_desde) {
          whereClause.fecha_ingreso[Op.gte] = fecha_ingreso_desde;
        }
        if (fecha_ingreso_hasta) {
          whereClause.fecha_ingreso[Op.lte] = fecha_ingreso_hasta;
        }
      }
    }


    const { count, rows: empleados } = await Empleado.findAndCountAll({
      where: whereClause,
      attributes: select === 'true' ? attributes : undefined, // Solo atributos específicos si 'select' es true
      include: select === 'true' ? [] : [{ // No incluir departamento si 'select' es true
        model: Departamento,
        as: 'departamento',
        attributes: ['id', 'nombre'],
      }],
      limit: currentLimit, // Usa el límite ajustado
      offset: currentOffset, // Usa el offset ajustado
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    });

    if (select === 'true') {
        // Para el dropdown, solo necesitamos la lista de empleados directamente
        return res.status(200).json(empleados);
    } else {
        // Para la paginación completa, devuelve el objeto con metadatos
        return res.status(200).json({
            total: count,
            pagina: parseInt(page),
            limite: parseInt(limit),
            total_paginas: Math.ceil(count / parseInt(limit)),
            empleados,
        });
    }

  } catch (error) {
    console.error('Error al obtener empleados:', error);
    // Asegúrate de usar `next(error)` si tienes un middleware de manejo de errores centralizado
    // O directamente `res.status(500).json({ message: 'Error interno del servidor.', error: error.message });`
    return res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};
// Obtener un empleado por ID
exports.obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Empleado.findByPk(id, {
      include: [{
        model: Departamento,
        as: 'departamento',
        attributes: ['id', 'nombre'],
      }],
    });

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    res.status(200).json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Actualizar un empleado
exports.actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_ingreso,
      puesto,
      estado,
      departamento_id,
      supervisor_id,
    } = req.body;

    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    // Validar formato de email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }
    if (telefono && !/^[0-9]+$/.test(telefono)){
      return res.status(400).json({ message: 'Formato de telefono inválido.' });
    }

    // Verificar si el nuevo email ya existe en otro empleado
    if (email && email !== empleado.email) {
      const empleadoExistente = await Empleado.findOne({ where: { email } });
      if (empleadoExistente) {
        return res.status(409).json({ message: 'Ya existe otro empleado con este email.' });
      }
    }

    // Validar que el departamento_id sea válido si se proporciona
    if (departamento_id !== undefined && departamento_id !== null) { // Permite desasignar el departamento
      const departamento = await Departamento.findByPk(departamento_id);
      if (!departamento) {
        return res.status(404).json({ message: 'El ID de departamento proporcionado no existe.' });
      }
    }

    // Validar que el supervisor_id sea válido si se proporciona
    if (supervisor_id !== undefined && supervisor_id !== null) {
        if (parseInt(supervisor_id) === parseInt(id)) { // No puede ser su propio supervisor
            return res.status(400).json({ message: 'Un empleado no puede ser su propio supervisor.' });
        }
        const supervisor = await Empleado.findByPk(supervisor_id);
        if (!supervisor) {
            return res.status(404).json({ message: 'El ID de supervisor proporcionado no existe.' });
        }
    }


    // Actualizar solo los campos proporcionados
    empleado.nombre = nombre || empleado.nombre;
    empleado.apellido = apellido || empleado.apellido;
    empleado.email = email || empleado.email;
    empleado.telefono = telefono || empleado.telefono;
    empleado.fecha_ingreso = fecha_ingreso || empleado.fecha_ingreso;
    empleado.puesto = puesto || empleado.puesto;
    empleado.estado = estado || empleado.estado;
    empleado.departamento_id = departamento_id !== undefined ? departamento_id : empleado.departamento_id; // Permite establecer a null
    empleado.supervisor_id = supervisor_id !== undefined ? supervisor_id : empleado.supervisor_id; // Permite establecer a null


    await empleado.save();

    res.status(200).json({
      message: 'Empleado actualizado exitosamente.',
      empleado: empleado,
    });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Eliminar un empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    await empleado.destroy();
    res.status(200).json({ message: 'Empleado eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Función auxiliar para construir la jerarquía recursivamente
async function construirJerarquia(empleadoId, departamentoId) {
  // 1. Obtener los datos del empleado actual
  const empleado = await Empleado.findByPk(empleadoId, {
      attributes: ['id', 'nombre', 'apellido', 'email', 'puesto']
  });

  // Si el empleado no existe, o no pertenece a este departamento (aunque filtramos por supervisor_id + departamento_id)
  if (!empleado) {
      return null;
  }

  // 2. Encontrar a todos los empleados que reportan directamente a este 'empleado'
  //    Y que P E R T E N E Z C A N   A L   M I S M O   D E P A R T A M E N T O
  const reportesDirectosDB = await Empleado.findAll({
      where: {
          supervisor_id: empleado.id,      // Su supervisor es el empleado actual
          departamento_id: departamentoId  // Están en el mismo departamento
      },
      attributes: ['id', 'nombre', 'apellido', 'email', 'puesto']
  });

  const reportesAnidados = [];
  for (const reporte of reportesDirectosDB) {
      // 3. ¡Llamada recursiva! Para cada reporte directo, construye su sub-árbol
      const subArbol = await construirJerarquia(reporte.id, departamentoId);
      if (subArbol) {
          reportesAnidados.push(subArbol);
      }
  }

  // 4. Devolver el empleado actual con sus reportes directos anidados
  return {
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      puesto: empleado.puesto,
      reportes_directos: reportesAnidados // <--- ESTA ES LA PROPIEDAD CRUCIAL QUE EL FRONTEND ESPERA
  };
}


// --- Tu función principal del controlador ---
exports.obtenerJerarquiaPorDepartamento = async (req, res) => {
  try {
      const { departamentoId } = req.params;

      const departamento = await Departamento.findByPk(departamentoId);
      if (!departamento) {
          return res.status(404).json({ message: 'Departamento no encontrado.' });
      }

      let jefeDirecto = null;
      if (departamento.jefe_departamento_id) {
          jefeDirecto = await Empleado.findByPk(departamento.jefe_departamento_id, {
              attributes: ['id', 'nombre', 'apellido', 'email', 'puesto'],
          });
      }

      let raicesJerarquia = [];
      // Si hay un jefe de departamento, solo él es la raíz principal de la jerarquía visual
      if (jefeDirecto) {
          // Construye el árbol completo para el jefe de departamento
          const arbolJefe = await construirJerarquia(jefeDirecto.id, departamentoId);
          if(arbolJefe) {
              raicesJerarquia.push(arbolJefe);
          }
      } else {
          // Si no hay jefe de departamento, busca empleados sin supervisor en ese departamento
          // Estos serán las raíces de la jerarquía visual
          const empleadosSinSupervisor = await Empleado.findAll({
              where: {
                  departamento_id: departamentoId,
                  supervisor_id: { [Op.is]: null }
              },
              attributes: ['id', 'nombre', 'apellido', 'email', 'puesto']
          });
          // Construye el árbol para cada uno de estos empleados "raíz"
          for (const raiz of empleadosSinSupervisor) {
              const arbol = await construirJerarquia(raiz.id, departamentoId);
              if (arbol) {
                  raicesJerarquia.push(arbol);
              }
          }
      }

      res.status(200).json({
          departamento: {
              id: departamento.id,
              nombre: departamento.nombre,
              descripcion: departamento.descripcion,
          },
          jefe_departamento: jefeDirecto ? {
              id: jefeDirecto.id,
              nombre: jefeDirecto.nombre,
              apellido: jefeDirecto.apellido,
              email: jefeDirecto.email,
              puesto: jefeDirecto.puesto
          } : null,
          estructura_organizacional: raicesJerarquia, // <-- Este array ya DEBE contener la estructura anidada
      });

  } catch (error) {
      console.error('Error al obtener la jerarquía por departamento:', error);
      res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};