const pool = require('../config/database');

const EmergencyContact = {
  // Crear un nuevo contacto de emergencia
  create: async (contactData) => {
    const {
      usuario_id,
      nombre,
      telefono,
      relacion
    } = contactData;
    
    const query = `
      INSERT INTO contactos_emergencia (usuario_id, nombre, telefono, relacion)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [usuario_id, nombre, telefono, relacion];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear contacto de emergencia: ${error.message}`);
    }
  },

  // Buscar contacto por ID
  findById: async (id) => {
    const query = `
      SELECT ce.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos
      FROM contactos_emergencia ce
      JOIN usuarios u ON ce.usuario_id = u.id
      WHERE ce.id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar contacto por ID: ${error.message}`);
    }
  },

  // Obtener contactos por usuario
  findByUserId: async (userId) => {
    const query = `
      SELECT * 
      FROM contactos_emergencia 
      WHERE usuario_id = $1
      ORDER BY nombre
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener contactos por usuario: ${error.message}`);
    }
  },

  // Actualizar contacto de emergencia
  update: async (id, contactData) => {
    const {
      nombre,
      telefono,
      relacion
    } = contactData;
    
    const query = `
      UPDATE contactos_emergencia 
      SET nombre = $1, telefono = $2, relacion = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [nombre, telefono, relacion, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar contacto: ${error.message}`);
    }
  },

  // Eliminar contacto de emergencia
  delete: async (id) => {
    const query = 'DELETE FROM contactos_emergencia WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar contacto: ${error.message}`);
    }
  }
};

module.exports = EmergencyContact;