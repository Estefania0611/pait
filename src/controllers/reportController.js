const Appointment = require('../models/appointment');
const MedicalRecord = require('../models/medicalRecord');

// Generar reporte de citas atendidas por fecha
const generateAppointmentsReport = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const doctorId = req.user.id;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Fecha de inicio y fecha de fin son requeridas.' });
    }
    
    // Obtener citas completadas en el rango de fechas
    const appointments = await Appointment.findCompletedByDoctorAndDateRange(
      doctorId,
      fecha_inicio,
      fecha_fin
    );
    
    // Obtener detalles de cada cita
    const report = await Promise.all(
      appointments.map(async (appointment) => {
        const medicalRecord = await MedicalRecord.findByAppointmentId(appointment.id);
        return {
          id: appointment.id,
          fecha: appointment.fecha,
          hora: appointment.hora,
          paciente: `${appointment.paciente_nombres} ${appointment.paciente_apellidos}`,
          cedula: appointment.paciente_cedula,
          sintomas: medicalRecord?.sintomas || '',
          diagnostico: medicalRecord?.diagnostico || '',
          tratamiento: medicalRecord?.tratamiento || '',
          medicamentos: medicalRecord?.medicamentos_recetados || ''
        };
      })
    );
    
    res.json({
      doctor: `${req.user.nombres} ${req.user.apellidos}`,
      periodo: `${fecha_inicio} a ${fecha_fin}`,
      total_citas: report.length,
      citas: report
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error al generar el reporte.' });
  }
};

// Generar reporte de pacientes atendidos por enfermedad
const generateDiseaseReport = async (req, res) => {
  try {
    const { enfermedad, fecha_inicio, fecha_fin } = req.query;
    const doctorId = req.user.id;
    
    if (!enfermedad || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        message: 'Enfermedad, fecha de inicio y fecha de fin son requeridas.' 
      });
    }
    
    // Obtener registros médicos que coincidan con la enfermedad
    const medicalRecords = await MedicalRecord.findByDiseaseAndDoctor(
      enfermedad,
      doctorId,
      fecha_inicio,
      fecha_fin
    );
    
    // Obtener detalles de cada paciente
    const report = await Promise.all(
      medicalRecords.map(async (record) => {
        const appointment = await Appointment.findById(record.cita_id);
        const patient = await User.findById(appointment.paciente_id);
        
        return {
          fecha: appointment.fecha,
          paciente: `${patient.nombres} ${patient.apellidos}`,
          cedula: patient.cedula,
          sintomas: record.sintomas,
          diagnostico: record.diagnostico,
          tratamiento: record.tratamiento,
          medicamentos: record.medicamentos_recetados
        };
      })
    );
    
    res.json({
      doctor: `${req.user.nombres} ${req.user.apellidos}`,
      enfermedad,
      periodo: `${fecha_inicio} a ${fecha_fin}`,
      total_pacientes: report.length,
      pacientes: report
    });
  } catch (error) {
    console.error('Error al generar reporte por enfermedad:', error);
    res.status(500).json({ message: 'Error al generar el reporte por enfermedad.' });
  }
};

module.exports = {
  generateAppointmentsReport,
  generateDiseaseReport
};