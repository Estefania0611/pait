const express = require('express');
const router = express.Router();
const { auth, isDoctor } = require('../middleware/auth');
const {
  generateAppointmentsReport,
  generateDiseaseReport
} = require('../controllers/reportController');

// Todas las rutas requieren autenticación y rol de médico
router.use(auth, isDoctor);

// @route   GET /api/reportes/citas
// @desc    Generar reporte de citas atendidas por fecha
// @access  Private (Médico)
router.get('/citas', generateAppointmentsReport);

// @route   GET /api/reportes/enfermedades
// @desc    Generar reporte de pacientes atendidos por enfermedad
// @access  Private (Médico)
router.get('/enfermedades', generateDiseaseReport);

module.exports = router;