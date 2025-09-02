const pool = require('../config/database');

const User = {
  // Crear un nuevo usuario
  create: async (userData) => {
    const {
      nombres,
      apellidos,
      correo,
      password,
      telefono,
      cedula,
      rol = 'paciente'
    } = userData;
    
    const query = `
      INSERT INTO usuarios (nombres, apellidos, correo, password, telefono, cedula, rol)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombres, apellidos, correo, telefono, cedula, rol, created_at
    `;
    
    const values = [nombres, apellidos, correo, password, telefono, cedula, rol];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  },

  // Buscar usuario por email
  findByEmail: async (email) => {
    const query = `
      SELECT id, nombres, apellidos, correo, password, telefono, cedula, rol, created_at
      FROM usuarios 
      WHERE correo = $1
    `;
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  },

  // Buscar usuario por ID
  findById: async (id) => {
    const query = `
      SELECT id, nombres, apellidos, correo, telefono, cedula, rol, created_at
      FROM usuarios 
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  },

  // Buscar usuario por cédula
  findByCedula: async (cedula) => {
    const query = `
      SELECT id, nombres, apellidos, correo, telefono, cedula, rol, created_at
      FROM usuarios 
      WHERE cedula = $1
    `;
    
    try {
      const result = await pool.query(query, [cedula]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por cédula: ${error.message}`);
    }
  },

  // Obtener todos los usuarios
  findAll: async () => {
    const query = `
      SELECT id, nombres, apellidos, correo, telefono, cedula, rol, created_at
      FROM usuarios 
      ORDER BY apellidos, nombres
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener todos los usuarios: ${error.message}`);
    }
  },

  // Obtener usuarios por rol
  findByRole: async (rol) => {
    const query = `
      SELECT id, nombres, apellidos, correo, telefono, cedula, rol, created_at
      FROM usuarios 
      WHERE rol = $1
      ORDER BY apellidos, nombres
    `;
    
    try {
      const result = await pool.query(query, [rol]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
    }
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const {
      nombres,
      apellidos,
      telefono
    } = userData;
    
    const query = `
      UPDATE usuarios 
      SET nombres = $1, apellidos = $2, telefono = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, nombres, apellidos, correo, telefono, cedula, rol, created_at, updated_at
    `;
    
    const values = [nombres, apellidos, telefono, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  },

  // Cambiar contraseña
  updatePassword: async (id, newPassword) => {
    const query = `
      UPDATE usuarios 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    
    const values = [newPassword, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  },

  // Eliminar usuario (solo administradores)
  delete: async (id) => {
    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
};

module.exports = User;