// databaseInit.js
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa');

    // Crear tablas
    await pool.query(`
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

      CREATE TABLE IF NOT EXISTS contactos_emergencia (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        relacion VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS historial_medico (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        enfermedad VARCHAR(255) NOT NULL,
        diagnostico TEXT,
        fecha_diagnostico DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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
    `);

    console.log('✅ Tablas creadas');

    // Poblar datos de prueba
    console.log('📝 Insertando datos de prueba...');

    // Limpiar tablas
    await pool.query('DELETE FROM registros_consulta');
    await pool.query('DELETE FROM citas');
    await pool.query('DELETE FROM historial_medico');
    await pool.query('DELETE FROM contactos_emergencia');
    await pool.query('DELETE FROM usuarios');

    // Hash de contraseñas
    const hashedPasswordPatient = await bcrypt.hash('password123', 10);
    const hashedPasswordDoctor = await bcrypt.hash('doctor123', 10);
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

    const users = [
      { nombres: 'Juan', apellidos: 'Pérez', correo: 'juan.perez@email.com', password: hashedPasswordPatient, telefono: '0987654321', cedula: '1234567890', rol: 'paciente' },
      { nombres: 'María', apellidos: 'López', correo: 'maria.lopez@email.com', password: hashedPasswordPatient, telefono: '0977777777', cedula: '0987654321', rol: 'paciente' },
      { nombres: 'Jessica', apellidos: 'Suarez', correo: 'jessica.suarez@istpet.edu.ec', password: hashedPasswordDoctor, telefono: '0966666666', cedula: '1122334455', rol: 'medico' },
      { nombres: 'Dra. Ana', apellidos: 'Martínez', correo: 'ana.martinez@email.com', password: hashedPasswordDoctor, telefono: '0955555555', cedula: '2233445566', rol: 'medico' },
      { nombres: 'Admin', apellidos: 'Sistema', correo: 'admin@email.com', password: hashedPasswordAdmin, telefono: '0999999999', cedula: '9999999999', rol: 'administrador' }
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, correo, password, telefono, cedula, rol)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [user.nombres, user.apellidos, user.correo, user.password, user.telefono, user.cedula, user.rol]
      );
    }

    console.log('✅ Usuarios de prueba creados');

    // Obtener IDs
    const patientResult = await pool.query('SELECT id FROM usuarios WHERE correo = $1', ['juan.perez@email.com']);
    const doctorResult = await pool.query('SELECT id FROM usuarios WHERE correo = $1', ['jessica.suarez@istpet.edu.ec']);
    const patientId = patientResult.rows[0].id;
    const doctorId = doctorResult.rows[0].id;

    // Contacto de emergencia
    await pool.query(
      `INSERT INTO contactos_emergencia (usuario_id, nombre, telefono, relacion)
       VALUES ($1,$2,$3,$4)`,
      [patientId, 'Ana Pérez', '0977777777', 'Hermana']
    );

    // Historial médico
    await pool.query(
      `INSERT INTO historial_medico (usuario_id, enfermedad, diagnostico, fecha_diagnostico)
       VALUES ($1,$2,$3,$4)`,
      [patientId, 'Diabetes tipo 2', 'Diagnosticado en 2020', '2020-05-15']
    );

    // Citas
    const appointments = [
      { paciente_id: patientId, medico_id: doctorId, fecha: '2024-01-15', hora: '08:30', estado: 'completada' },
      { paciente_id: patientId, medico_id: doctorId, fecha: '2024-01-20', hora: '09:00', estado: 'programada' }
    ];

    for (const apt of appointments) {
      await pool.query(
        `INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado)
         VALUES ($1,$2,$3,$4,$5)`,
        [apt.paciente_id, apt.medico_id, apt.fecha, apt.hora, apt.estado]
      );
    }

    // Registro médico
    const appointmentResult = await pool.query(
      'SELECT id FROM citas WHERE fecha = $1 AND hora = $2',
      ['2024-01-15', '08:30']
    );
    const appointmentId = appointmentResult.rows[0].id;

    await pool.query(
      `INSERT INTO registros_consulta (cita_id, sintomas, diagnostico, tratamiento, medicamentos_recetados, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [appointmentId, 'Fiebre, dolor de cabeza', 'Gripe común', 'Reposo y líquidos', 'Paracetamol 500mg cada 8 horas', 'Volver en 3 días si no mejora']
    );

    console.log('✅ Datos de prueba creados con éxito');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
setupDatabase();

module.exports = pool;
