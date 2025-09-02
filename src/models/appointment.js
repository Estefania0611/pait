const pool = require('../config/database');

const Appointment = {
  // Crear una nueva cita
  create: async (appointmentData) => {
    const {
      paciente_id,
      medico_id,
      fecha,
      hora,
      estado = 'programada'
    } = appointmentData;
    
    const query = `
      INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [paciente_id, medico_id, fecha, hora, estado];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear cita: ${error.message}`);
    }
  },

  // Buscar cita por ID
  findById: async (id) => {
    const query = `
      SELECT c.*, 
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula,
             m.nombres as medico_nombres, m.apellidos as medico_apellidos
      FROM citas c
      JOIN usuarios p ON c.paciente_id = p.id
      JOIN usuarios m ON c.medico_id = m.id
      WHERE c.id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar cita por ID: ${error.message}`);
    }
  },

  // Obtener citas por médico y fecha
  findByDoctor: async (doctorId, date) => {
    const query = `
      SELECT c.*, 
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula
      FROM citas c
      JOIN usuarios p ON c.paciente_id = p.id
      WHERE c.medico_id = $1 AND c.fecha = $2
      ORDER BY c.hora
    `;
    
    try {
      const result = await pool.query(query, [doctorId, date]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener citas por médico: ${error.message}`);
    }
  },

  // Obtener citas por paciente
  findByPatient: async (patientId) => {
    const query = `
      SELECT c.*, 
             m.nombres as medico_nombres, m.apellidos as medico_apellidos
      FROM citas c
      JOIN usuarios m ON c.medico_id = m.id
      WHERE c.paciente_id = $1
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    
    try {
      const result = await pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener citas por paciente: ${error.message}`);
    }
  },

  // Obtener citas completadas por médico y rango de fechas
  findCompletedByDoctorAndDateRange: async (doctorId, startDate, endDate) => {
    const query = `
      SELECT c.*, 
             p.nombres as paciente_nombres, p.apellidos as paciente_apellidos, p.cedula as paciente_cedula
      FROM citas c
      JOIN usuarios p ON c.paciente_id = p.id
      WHERE c.medico_id = $1 
      AND c.estado = 'completada'
      AND c.fecha BETWEEN $2 AND $3
      ORDER BY c.fecha, c.hora
    `;
    
    try {
      const result = await pool.query(query, [doctorId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener citas completadas: ${error.message}`);
    }
  },

  // Actualizar estado de cita
  updateStatus: async (id, status) => {
    const query = `
      UPDATE citas 
      SET estado = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar estado de cita: ${error.message}`);
    }
  },

  // Actualizar cita completa
  update: async (id, appointmentData) => {
    const {
      fecha,
      hora,
      estado
    } = appointmentData;
    
    const query = `
      UPDATE citas 
      SET fecha = $1, hora = $2, estado = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [fecha, hora, estado, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar cita: ${error.message}`);
    }
  },

  // Eliminar cita
  delete: async (id) => {
    const query = 'DELETE FROM citas WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar cita: ${error.message}`);
    }
  },

  // Verificar disponibilidad de horario
  checkAvailability: async (doctorId, fecha, hora) => {
    const query = `
      SELECT id 
      FROM citas 
      WHERE medico_id = $1 AND fecha = $2 AND hora = $3 AND estado != 'cancelada'
    `;
    
    try {
      const result = await pool.query(query, [doctorId, fecha, hora]);
      return result.rows.length === 0;
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }
};

module.exports = Appointment;