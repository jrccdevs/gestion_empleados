const { Usuario } = require('../models'); // Importar Usuario
const jwt = require('jsonwebtoken');

const generateToken = (usuario) => { // Recibe un usuario
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol }, // Usar rol
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, contrasena, rol } = req.body; // Recibe contrasena y rol

    if (!email || !contrasena) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (rol && !['admin', 'empleado'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ message: 'Ya existe un usuario con este email' });
    }

    const nuevoUsuario = await Usuario.create({ email, contrasena, rol: rol || 'empleado' }); // Crea con contrasena y rol

    const usuarioResponse = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol, // Usa rol
      createdAt: nuevoUsuario.createdAt,
      updatedAt: nuevoUsuario.updatedAt,
    };

    res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: usuarioResponse });
  } catch (error) {
    console.error('Error durante el registro:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body; // Recibe contrasena

    if (!email || !contrasena) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const esCorrecta = await usuario.compararContrasena(contrasena); // Usa compararContrasena

    if (!esCorrecta) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(usuario);

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol // Usa rol
    }});
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};