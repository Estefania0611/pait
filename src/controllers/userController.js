const bcrypt = require('bcryptjs');
const User = require('../models/user');
const EmergencyContact = require('../models/emergencyContact');
const MedicalHistory = require('../models/medicalHistory');

// Obtener todos los usuarios (solo administradores)
const getAllUsers = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo permitir si es el propio usuario, un médico o administrador
    if (req.user.id !== parseInt(id) && req.user.rol !== 'medico' && req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
    // Obtener contactos de emergencia
    const emergencyContacts = await EmergencyContact.findByUserId(id);
    
    // Obtener historial médico
    const medicalHistory = await MedicalHistory.findByUserId(id);
    
    res.json({
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        telefono: user.telefono,
        cedula: user.cedula,
        rol: user.rol
      },
      emergencyContacts,
      medicalHistory
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario.' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo permitir si es el propio usuario o un administrador
    if (req.user.id !== parseInt(id) && req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    const {
      nombres,
      apellidos,
      telefono
    } = req.body;
    
    const updatedUser = await User.update(id, {
      nombres,
      apellidos,
      telefono
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

// Agregar contacto de emergencia
const addEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, relacion } = req.body;
    
    // Solo permitir si es el propio usuario
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    if (!nombre || !telefono) {
      return res.status(400).json({ message: 'Nombre y teléfono son requeridos.' });
    }
    
    const contact = await EmergencyContact.create({
      usuario_id: id,
      nombre,
      telefono,
      relacion
    });
    
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error al agregar contacto:', error);
    res.status(500).json({ message: 'Error al agregar el contacto de emergencia.' });
  }
};

// Agregar historial médico
const addMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { enfermedad, diagnostico, fecha_diagnostico } = req.body;
    
    // Solo permitir si es el propio usuario, un médico o administrador
    if (req.user.id !== parseInt(id) && req.user.rol !== 'medico' && req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    if (!enfermedad) {
      return res.status(400).json({ message: 'La enfermedad es requerida.' });
    }
    
    const history = await MedicalHistory.create({
      usuario_id: id,
      enfermedad,
      diagnostico,
      fecha_diagnostico
    });
    
    res.status(201).json(history);
  } catch (error) {
    console.error('Error al agregar historial:', error);
    res.status(500).json({ message: 'Error al agregar el historial médico.' });
  }
};

// Obtener todos los médicos
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.findByRole('medico');
    res.json(doctors);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ message: 'Error al obtener los médicos.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  addEmergencyContact,
  addMedicalHistory,
  getAllDoctors
};