const jwt = require('jsonwebtoken');
const { Usuario } = require('../models'); // Importar Usuario

exports.protect = async (req, res, next) => {
  let token;
  console.log('Protect Middleware: Checking Authorization Header...');
  console.log('Protect Middleware: req.headers:', req.headers); // Log ALL headers

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Protect Middleware: Token found in header:', token); // Log the extracted token

  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Protect Middleware: Token decoded:', decoded); // Log the decoded payload

    req.user = await Usuario.findByPk(decoded.id, { // Asigna a req.usuario
      attributes: { exclude: ['contrasena'] } // Excluir la contraseña hasheada
    });

    if (!req.user) { // Usa req.usuario
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    console.error('Error de verificación de token:', error);
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    console.log('Authorize: Checking roles for user:', req.user ? req.user.email : 'N/A', 'Role:', req.user ? req.user.rol : 'N/A');
    console.log('Authorize: Required roles:', roles);

    if (!req.user || !req.user.rol) {
      return res.status(403).json({ message: 'No user role found or user not authenticated.' });
    }
    if (roles.length > 0 && !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: `User role ${req.user.rol} is not authorized to access this route.` });
    }
    next();
  };
};
