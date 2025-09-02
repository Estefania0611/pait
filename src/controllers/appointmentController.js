const Appointment = require('../models/appointment');
const MedicalRecord = require('../models/medicalRecord');
const { generateTimeSlots } = require('../utils/timeSlots');

// Obtener citas por médico
const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { fecha } = req.query;
    const doctorId = req.user.id;
    
    if (!fecha) {
      return res.status(400).json({ message: 'La fecha es requerida.' });
    }
    
    const appointments = await Appointment.findByDoctor(doctorId, fecha);
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener las citas.' });
  }
};

// Obtener horarios disponibles
const getAvailableSlots = async (req, res) => {
  try {
    const { fecha, medico_id } = req.query;
    
    if (!fecha || !medico_id) {
      return res.status(400).json({ message: 'Fecha y médico son requeridos.' });
    }
    
    // Obtener citas existentes para el médico en la fecha especificada
    const existingAppointments = await Appointment.findByDoctor(medico_id, fecha);
    const bookedSlots = existingAppointments.map(apt => apt.hora);
    
    // Generar todos los slots disponibles
    const allSlots = generateTimeSlots();
    
    // Filtrar los slots que ya están ocupados
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json(availableSlots);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ message: 'Error al obtener los horarios disponibles.' });
  }
};

// Crear nueva cita
const createAppointment = async (req, res) => {
  try {
    const { paciente_id, fecha, hora } = req.body;
    const medico_id = req.user.rol === 'medico' ? req.user.id : req.body.medico_id;
    
    if (!paciente_id || !fecha || !hora || !medico_id) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    
    // Validar que la hora esté dentro de los horarios permitidos
    const allSlots = generateTimeSlots();
    if (!allSlots.includes(hora)) {
      return res.status(400).json({ message: 'Horario no válido.' });
    }
    
    // Verificar si ya existe una cita a la misma hora
    const existingAppointments = await Appointment.findByDoctor(medico_id, fecha);
    const existingSlot = existingAppointments.find(apt => apt.hora === hora);
    
    if (existingSlot) {
      return res.status(400).json({ message: 'El horario ya está ocupado.' });
    }
    
    const appointment = await Appointment.create({
      paciente_id,
      medico_id,
      fecha,
      hora,
      estado: 'programada'
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error al crear la cita.' });
  }
};

// Actualizar estado de cita
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ message: 'El estado es requerido.' });
    }
    
    const validStatuses = ['programada', 'confirmada', 'completada', 'cancelada'];
    if (!validStatuses.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido.' });
    }
    
    const appointment = await Appointment.updateStatus(id, estado);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ message: 'Error al actualizar la cita.' });
  }
};

// Registrar atención médica
const recordMedicalAttention = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const {
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos_recetados,
      observaciones
    } = req.body;
    
    // Verificar que la cita existe y pertenece al médico
    const appointment = await Appointment.findById(cita_id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada.' });
    }
    
    if (appointment.medico_id !== req.user.id) {
      return res.status(403).json({ message: 'No tiene permisos para atender esta cita.' });
    }
    
    // Crear registro médico
    const medicalRecord = await MedicalRecord.create({
      cita_id,
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos_recetados,
      observaciones
    });
    
    // Actualizar estado de la cita a completada
    await Appointment.updateStatus(cita_id, 'completada');
    
    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error('Error al registrar atención:', error);
    res.status(500).json({ message: 'Error al registrar la atención médica.' });
  }
};

// Obtener historial de citas de un paciente
const getPatientAppointments = async (req, res) => {
  try {
    const paciente_id = req.user.rol === 'paciente' ? req.user.id : req.params.paciente_id;
    
    const appointments = await Appointment.findByPatient(paciente_id);
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener el historial de citas.' });
  }
};

module.exports = {
  getAppointmentsByDoctor,
  getAvailableSlots,
  createAppointment,
  updateAppointmentStatus,
  recordMedicalAttention,
  getPatientAppointments
};