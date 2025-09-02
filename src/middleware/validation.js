const { body, validationResult } = require('express-validator');

// Validaciones para registro de usuario
const validateUserRegistration = [
  body('nombres')
    .notEmpty()
    .withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres'),
  
  body('apellidos')
    .notEmpty()
    .withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
  
  body('correo')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('cedula')
    .notEmpty()
    .withMessage('La cédula es requerida')
    .isLength({ min: 10, max: 13 })
    .withMessage('La cédula debe tener entre 10 y 13 caracteres'),
  
  body('telefono')
    .optional()
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validaciones para login
const validateLogin = [
  body('correo')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validaciones para creación de cita
const validateAppointment = [
  body('paciente_id')
    .isInt({ min: 1 })
    .withMessage('ID de paciente válido es requerido'),
  
  body('medico_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de médico válido es requerido'),
  
  body('fecha')
    .isDate()
    .withMessage('Fecha válida es requerida'),
  
  body('hora')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora válida es requerida (formato HH:MM)'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validaciones para contacto de emergencia
const validateEmergencyContact = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),
  
  body('relacion')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La relación no debe exceder los 50 caracteres'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validaciones para historial médico
const validateMedicalHistory = [
  body('enfermedad')
    .notEmpty()
    .withMessage('La enfermedad es requerida')
    .isLength({ max: 255 })
    .withMessage('La enfermedad no debe exceder los 255 caracteres'),
  
  body('diagnostico')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('El diagnóstico no debe exceder los 1000 caracteres'),
  
  body('fecha_diagnostico')
    .optional()
    .isDate()
    .withMessage('Fecha de diagnóstico debe ser válida'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validaciones para registro médico
const validateMedicalRecord = [
  body('sintomas')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los síntomas no deben exceder los 1000 caracteres'),
  
  body('diagnostico')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('El diagnóstico no debe exceder los 1000 caracteres'),
  
  body('tratamiento')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('El tratamiento no debe exceder los 1000 caracteres'),
  
  body('medicamentos_recetados')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Los medicamentos no deben exceder los 500 caracteres'),
  
  body('observaciones')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no deben exceder los 1000 caracteres'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateAppointment,
  validateEmergencyContact,
  validateMedicalHistory,
  validateMedicalRecord
};