const pool = require('../config/database');

const MedicalHistory = {
  // Crear un nuevo registro de historial médico
  create: async (historyData) => {
    const {
      usuario_id,
      enfermedad,
      diagnostico,
      fecha_diagnostico
    } = historyData;
    
    const query = `
      INSERT INTO historial_medico (usuario_id, enfermedad, diagnostico, fecha_diagnostico)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [usuario_id, enfermedad, diagnostico, fecha_diagnostico];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear historial médico: ${error.message}`);
    }
  },

  // Buscar registro por ID
  findById: async (id) => {
    const query = `
      SELECT hm.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos
      FROM historial_medico hm
      JOIN usuarios u ON hm.usuario_id = u.id
      WHERE hm.id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar historial por ID: ${error.message}`);
    }
  },

  // Obtener historial por usuario
  findByUserId: async (userId) => {
    const query = `
      SELECT * 
      FROM historial_medico 
      WHERE usuario_id = $1
      ORDER BY fecha_diagnostico DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener historial por usuario: ${error.message}`);
    }
  },

  // Buscar historial por enfermedad
  findByDisease: async (userId, disease) => {
    const query = `
      SELECT * 
      FROM historial_medico 
      WHERE usuario_id = $1 AND enfermedad ILIKE $2
      ORDER BY fecha_diagnostico DESC
    `;
    
    try {
      const result = await pool.query(query, [userId, `%${disease}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al buscar historial por enfermedad: ${error.message}`);
    }
  },

  // Actualizar historial médico
  update: async (id, historyData) => {
    const {
      enfermedad,
      diagnostico,
      fecha_diagnostico
    } = historyData;
    
    const query = `
      UPDATE historial_medico 
      SET enfermedad = $1, diagnostico = $2, fecha_diagnostico = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [enfermedad, diagnostico, fecha_diagnostico, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar historial médico: ${error.message}`);
    }
  },

  // Eliminar registro de historial médico
  delete: async (id) => {
    const query = 'DELETE FROM historial_medico WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar historial médico: ${error.message}`);
    }
  }
};

module.exports = MedicalHistory;