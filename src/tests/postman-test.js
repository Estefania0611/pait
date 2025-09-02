// Script para poblar la base de datos con datos de prueba
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const populateTestData = async () => {
  try {
    console.log('Poblando base de datos con datos de prueba...');
    
    // Limpiar tablas
    await pool.query('DELETE FROM registros_consulta');
    await pool.query('DELETE FROM citas');
    await pool.query('DELETE FROM historial_medico');
    await pool.query('DELETE FROM contactos_emergencia');
    await pool.query('DELETE FROM usuarios');
    console.log("Primero se borran los datos existentes");
    // Hashear contraseñas
    const hashedPasswordPatient = await bcrypt.hash('password123', 10);
    const hashedPasswordDoctor = await bcrypt.hash('doctor123', 10);
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    
    // Insertar usuarios de prueba
    const users = [
      // Pacientes
      {
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan.perez@email.com',
        password: hashedPasswordPatient,
        telefono: '0987654321',
        cedula: '1234567890',
        rol: 'paciente'
      },
      {
        nombres: 'María',
        apellidos: 'López',
        correo: 'maria.lopez@email.com',
        password: hashedPasswordPatient,
        telefono: '0977777777',
        cedula: '0987654321',
        rol: 'paciente'
      },
      // Médicos
      {
        nombres: 'Jessica',
        apellidos: 'Suarez',
        correo: 'jessica.suarez@istpet.edu.ec',
        password: hashedPasswordDoctor,
        telefono: '0966666666',
        cedula: '1122334455',
        rol: 'medico'
      },
      {
        nombres: 'Dra. Ana',
        apellidos: 'Martínez',
        correo: 'ana.martinez@email.com',
        password: hashedPasswordDoctor,
        telefono: '0955555555',
        cedula: '2233445566',
        rol: 'medico'
      },
      // Administrador
      {
        nombres: 'Admin',
        apellidos: 'Sistema',
        correo: 'admin@email.com',
        password: hashedPasswordAdmin,
        telefono: '0999999999',
        cedula: '9999999999',
        rol: 'administrador'
      }
    ];
    
    for (const user of users) {
      await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, correo, password, telefono, cedula, rol) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.nombres, user.apellidos, user.correo, user.password, user.telefono, user.cedula, user.rol]
      );
    }
    
    console.log('Usuarios de prueba creados exitosamente');
    
    // Obtener IDs de usuarios insertados
    const patientResult = await pool.query('SELECT id FROM usuarios WHERE correo = $1', ['juan.perez@email.com']);
    const doctorResult = await pool.query('SELECT id FROM usuarios WHERE correo = $1', ['jessica.suarez@istpet.edu.ec']);
    
    const patientId = patientResult.rows[0].id;
    const doctorId = doctorResult.rows[0].id;
    
    // Insertar contactos de emergencia
    await pool.query(
      `INSERT INTO contactos_emergencia (usuario_id, nombre, telefono, relacion) 
       VALUES ($1, $2, $3, $4)`,
      [patientId, 'Ana Pérez', '0977777777', 'Hermana']
    );
    
    // Insertar historial médico
    await pool.query(
      `INSERT INTO historial_medico (usuario_id, enfermedad, diagnostico, fecha_diagnostico) 
       VALUES ($1, $2, $3, $4)`,
      [patientId, 'Diabetes tipo 2', 'Diagnosticado en 2020', '2020-05-15']
    );
    
    // Insertar citas de prueba
    const appointments = [
      {
        paciente_id: patientId,
        medico_id: doctorId,
        fecha: '2024-01-15',
        hora: '08:30',
        estado: 'completada'
      },
      {
        paciente_id: patientId,
        medico_id: doctorId,
        fecha: '2024-01-20',
        hora: '09:00',
        estado: 'programada'
      }
    ];
    
    for (const apt of appointments) {
      await pool.query(
        `INSERT INTO citas (paciente_id, medico_id, fecha, hora, estado) 
         VALUES ($1, $2, $3, $4, $5)`,
        [apt.paciente_id, apt.medico_id, apt.fecha, apt.hora, apt.estado]
      );
    }
    
    // Obtener ID de la cita completada
    const appointmentResult = await pool.query(
      'SELECT id FROM citas WHERE fecha = $1 AND hora = $2',
      ['2024-01-15', '08:30']
    );
    
    const appointmentId = appointmentResult.rows[0].id;
    
    // Insertar registro médico
    await pool.query(
      `INSERT INTO registros_consulta (cita_id, sintomas, diagnostico, tratamiento, medicamentos_recetados, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        appointmentId,
        'Fiebre, dolor de cabeza',
        'Gripe común',
        'Reposo y líquidos',
        'Paracetamol 500mg cada 8 horas',
        'Volver en 3 días si no mejora'
      ]
    );
    
    console.log('Datos de prueba creados exitosamente');
    console.log('Credenciales para testing:');
    
    
  } catch (error) {
    console.error('Error al poblar datos de prueba:', error);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  populateTestData();
}

module.exports = { populateTestData };