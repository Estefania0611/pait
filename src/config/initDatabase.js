// initDatabase.js
const pool = require('./database');
const { populateTestData } = require('../tests/postman-test');

const createTables = async () => {
  const schemaSQL = `
  -- Tabla de usuarios
  CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombres VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      correo VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      telefono VARCHAR(20),
      cedula VARCHAR(20) UNIQUE NOT NULL,
      rol VARCHAR(20) DEFAULT 'paciente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de contactos de emergencia
  CREATE TABLE IF NOT EXISTS contactos_emergencia (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre VARCHAR(100) NOT NULL,
      telefono VARCHAR(20) NOT NULL,
      relacion VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de historial médico
  CREATE TABLE IF NOT EXISTS historial_medico (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      enfermedad VARCHAR(255) NOT NULL,
      diagnostico TEXT,
      fecha_diagnostico DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de citas
  CREATE TABLE IF NOT EXISTS citas (
      id SERIAL PRIMARY KEY,
      paciente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      medico_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      estado VARCHAR(20) DEFAULT 'programada',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabla de registros médicos
  CREATE TABLE IF NOT EXISTS registros_consulta (
      id SERIAL PRIMARY KEY,
      cita_id INTEGER REFERENCES citas(id) ON DELETE CASCADE,
      sintomas TEXT,
      diagnostico TEXT,
      tratamiento TEXT,
      medicamentos_recetados TEXT,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Índices
  CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_id, fecha);
  CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
  CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
  `;

  try {
    console.log("🔄 Creando tablas...");
    await pool.query(schemaSQL);
    console.log("✅ Tablas listas");
  } catch (error) {
    console.error("❌ Error creando tablas:", error);
  }
};

const initDatabase = async () => {
  try {
    await createTables();
    await populateTestData();
    console.log("✅ Base de datos inicializada con datos de prueba");
  } catch (error) {
    console.error("❌ Error inicializando la base de datos:", error);
  }
};

module.exports = { initDatabase };
