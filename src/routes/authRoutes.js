const express = require('express');
const { register, login } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Ruta de ejemplo protegida
router.get('/me', protect, (req, res) => {
  // req.usuario ahora contiene la información del usuario autenticado
  res.status(200).json({ usuario: req.usuario });
});

module.exports = router;