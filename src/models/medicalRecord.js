const pool = require('../config/database');

const MedicalRecord = {
  // Crear un nuevo registro médico
  create: async (recordData) => {
    const {
      cita_id,
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos_recetados,
      observaciones
    } = recordData;
    
    const query = `
      INSERT INTO registros_consulta (cita_id, sintomas, diagnostico, tratamiento, medicamentos_recetados, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [cita_id, sintomas, diagnostico, tratamiento, medicamentos_recetados, observaciones];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear registro médico: ${error.message}`);
    }
  },

  // Buscar registro por ID
  findById: async (id) => {
    const query = `
      SELECT rc.*, 
             c.fecha, c.hora,
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula,
             m.nombres as medico_nombres, m.apellidos as medico_apellidos
      FROM registros_consulta rc
      JOIN citas c ON rc.cita_id = c.id
      JOIN usuarios p ON c.paciente_id = p.id
      JOIN usuarios m ON c.medico_id = m.id
      WHERE rc.id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar registro por ID: ${error.message}`);
    }
  },

  // Buscar registro por cita
  findByAppointmentId: async (appointmentId) => {
    const query = `
      SELECT rc.*
      FROM registros_consulta rc
      WHERE rc.cita_id = $1
    `;
    
    try {
      const result = await pool.query(query, [appointmentId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar registro por cita: ${error.message}`);
    }
  },

  // Obtener registros por paciente
  findByPatientId: async (patientId) => {
    const query = `
      SELECT rc.*, 
             c.fecha, c.hora,
             m.nombres as medico_nombres, m.apellidos as medico_apellidos
      FROM registros_consulta rc
      JOIN citas c ON rc.cita_id = c.id
      JOIN usuarios m ON c.medico_id = m.id
      WHERE c.paciente_id = $1
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    
    try {
      const result = await pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener registros por paciente: ${error.message}`);
    }
  },

  // Obtener registros por médico
  findByDoctorId: async (doctorId) => {
    const query = `
      SELECT rc.*, 
             c.fecha, c.hora,
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula
      FROM registros_consulta rc
      JOIN citas c ON rc.cita_id = c.id
      JOIN usuarios p ON c.paciente_id = p.id
      WHERE c.medico_id = $1
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    
    try {
      const result = await pool.query(query, [doctorId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener registros por médico: ${error.message}`);
    }
  },

  // Buscar registros por enfermedad y médico
  findByDiseaseAndDoctor: async (disease, doctorId, startDate, endDate) => {
    const query = `
      SELECT rc.*, 
             c.fecha, c.hora,
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula
      FROM registros_consulta rc
      JOIN citas c ON rc.cita_id = c.id
      JOIN usuarios p ON c.paciente_id = p.id
      WHERE c.medico_id = $1 
      AND c.fecha BETWEEN $2 AND $3
      AND (rc.diagnostico ILIKE $4 OR rc.sintomas ILIKE $4)
      ORDER BY c.fecha, c.hora
    `;
    
    try {
      const result = await pool.query(query, [doctorId, startDate, endDate, `%${disease}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al buscar registros por enfermedad: ${error.message}`);
    }
  },

  // Actualizar registro médico
  update: async (id, recordData) => {
    const {
      sintomas,
      diagnostico,
      tratamiento,
      medicamentos_recetados,
      observaciones
    } = recordData;
    
    const query = `
      UPDATE registros_consulta 
      SET sintomas = $1, diagnostico = $2, tratamiento = $3, 
          medicamentos_recetados = $4, observaciones = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [sintomas, diagnostico, tratamiento, medicamentos_recetados, observaciones, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar registro médico: ${error.message}`);
    }
  },

  // Eliminar registro médico
  delete: async (id) => {
    const query = 'DELETE FROM registros_consulta WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar registro médico: ${error.message}`);
    }
  }
};

module.exports = MedicalRecord;