const express = require('express');
const router = express.Router();
const { auth, isDoctor } = require('../middleware/auth');
const {
  getAppointmentsByDoctor,
  getAvailableSlots,
  createAppointment,
  updateAppointmentStatus,
  recordMedicalAttention,
  getPatientAppointments
} = require('../controllers/appointmentController');

// Todas las rutas requieren autenticación
router.use(auth);

// @route   GET /api/citas/medico
// @desc    Obtener citas por médico y fecha
// @access  Private (Médico)
router.get('/medico', isDoctor, getAppointmentsByDoctor);

// @route   GET /api/citas/horarios-disponibles
// @desc    Obtener horarios disponibles para un médico y fecha
// @access  Private
router.get('/horarios-disponibles', getAvailableSlots);

// @route   POST /api/citas
// @desc    Crear nueva cita
// @access  Private
router.post('/', createAppointment);

// @route   PUT /api/citas/:id/estado
// @desc    Actualizar estado de una cita
// @access  Private
router.put('/:id/estado', updateAppointmentStatus);

// @route   POST /api/citas/:cita_id/atencion
// @desc    Registrar atención médica de una cita
// @access  Private (Médico)
router.post('/:cita_id/atencion', isDoctor, recordMedicalAttention);

// @route   GET /api/citas/paciente/:paciente_id?
// @desc    Obtener historial de citas de un paciente
// @access  Private
router.get('/paciente/:paciente_id?', getPatientAppointments);

module.exports = router;