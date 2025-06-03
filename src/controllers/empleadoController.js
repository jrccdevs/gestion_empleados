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
exports.obtenerEmpleados = async (req, res) => {
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
      page = 1, // Página actual, por defecto 1
      limit = 10, // Límite de resultados por página, por defecto 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

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

    // Filtro por rango de fecha de ingreso
    if (fecha_ingreso_desde || fecha_ingreso_hasta) {
      whereClause.fecha_ingreso = {};
      if (fecha_ingreso_desde) {
        whereClause.fecha_ingreso[Op.gte] = fecha_ingreso_desde;
      }
      if (fecha_ingreso_hasta) {
        whereClause.fecha_ingreso[Op.lte] = fecha_ingreso_hasta;
      }
    }

    const { count, rows: empleados } = await Empleado.findAndCountAll({
      where: whereClause,
      include: [{
        model: Departamento,
        as: 'departamento',
        attributes: ['id', 'nombre'], // Incluir solo los campos necesarios del departamento
      }],
      limit: parseInt(limit),
      offset: offset,
      order: [['apellido', 'ASC'], ['nombre', 'ASC']], // Ordenar por apellido y nombre
    });

    res.status(200).json({
      total: count,
      pagina: parseInt(page),
      limite: parseInt(limit),
      total_paginas: Math.ceil(count / parseInt(limit)),
      empleados,
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
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
    const empleado = await Empleado.findByPk(empleadoId, {
        attributes: ['id', 'nombre', 'apellido', 'email', 'puesto'],
        include: [{
            model: Empleado,
            as: 'subordinados',
            attributes: ['id', 'nombre', 'apellido', 'email', 'puesto'],
            where: { departamento_id: departamentoId }, // Solo subordinados del mismo departamento
            required: false // LEFT JOIN para incluir incluso si no hay subordinados
        }]
    });

    if (!empleado) {
        return null;
    }

    const nodo = {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        puesto: empleado.puesto,
        subordinados: []
    };

    if (empleado.subordinados && empleado.subordinados.length > 0) {
        for (const sub of empleado.subordinados) {
            // Recursivamente construir la jerarquía para cada subordinado
            const subNodo = await construirJerarquia(sub.id, departamentoId);
            if (subNodo) {
                nodo.subordinados.push(subNodo);
            }
        }
    }
    return nodo;
}


// Reporte jerárquico por departamento
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
            include: [{
                model: Departamento,
                as: 'departamento',
                attributes: ['id', 'nombre']
            }]
        });
    }

    // Si no hay jefe asignado al departamento, buscamos empleados sin supervisor dentro de ese departamento
    // para considerarlos "raíces" de la jerarquía (si no hay un jefe definido)
    let raicesJerarquia = [];
    if (jefeDirecto) {
        raicesJerarquia.push(jefeDirecto);
    } else {
        // Encuentra empleados que no tienen supervisor y pertenecen a este departamento
        // Estos serán las "raíces" de la jerarquía si no hay un jefe de departamento explícito
        const empleadosSinSupervisor = await Empleado.findAll({
            where: {
                departamento_id: departamentoId,
                supervisor_id: { [Op.is]: null }
            },
            attributes: ['id', 'nombre', 'apellido', 'email', 'puesto']
        });
        raicesJerarquia = empleadosSinSupervisor;
    }


    const jerarquia = [];
    for (const raiz of raicesJerarquia) {
        const arbol = await construirJerarquia(raiz.id, departamentoId);
        if (arbol) {
            jerarquia.push(arbol);
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
      estructura_organizacional: jerarquia,
    });

  } catch (error) {
    console.error('Error al obtener la jerarquía por departamento:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};