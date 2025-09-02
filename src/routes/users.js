const express = require('express');
const router = express.Router();
const { auth, isDoctor } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  addEmergencyContact,
  addMedicalHistory,
  getAllDoctors
} = require('../controllers/userController');

// Todas las rutas requieren autenticación
router.use(auth);

// @route   GET /api/usuarios
// @desc    Obtener todos los usuarios (solo administradores)
// @access  Private (Administrador)
router.get('/', getAllUsers);

// @route   GET /api/usuarios/medicos
// @desc    Obtener todos los médicos
// @access  Private
router.get('/medicos', getAllDoctors);

// @route   GET /api/usuarios/:id
// @desc    Obtener usuario por ID con contactos e historial médico
// @access  Private
router.get('/:id', getUserById);

// @route   PUT /api/usuarios/:id
// @desc    Actualizar información de usuario
// @access  Private
router.put('/:id', updateUser);

// @route   POST /api/usuarios/:id/contactos-emergencia
// @desc    Agregar contacto de emergencia a un usuario
// @access  Private
router.post('/:id/contactos-emergencia', addEmergencyContact);

// @route   POST /api/usuarios/:id/historial-medico
// @desc    Agregar registro al historial médico de un usuario
// @access  Private (Médico o Administrador)
router.post('/:id/historial-medico', addMedicalHistory);

module.exports = router;