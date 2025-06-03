const jwt = require('jsonwebtoken');
const { Usuario } = require('../models'); // Importar Usuario

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = await Usuario.findByPk(decoded.id, { // Asigna a req.usuario
      attributes: { exclude: ['contrasena'] } // Excluir la contraseña hasheada
    });

    if (!req.usuario) { // Usa req.usuario
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    console.error('Error de verificación de token:', error);
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) { // Usa req.usuario.rol
      return res.status(403).json({ message: `El rol del usuario ${req.usuario.rol} no está autorizado para acceder a esta ruta` });
    }
    next();
  };
};