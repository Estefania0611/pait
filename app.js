const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initializeDatabase, populateTestData } = require('./src/config/database');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const userRoutes = require('./src/routes/users');
const reportRoutes = require('./src/routes/reports');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar base de datos y luego levantar el servidor
(async () => {
  await initializeDatabase();
  // await populateTestData(); // Descomenta si quieres datos de prueba

  // Rutas API
  app.use('/api/auth', authRoutes);
  app.use('/api/citas', appointmentRoutes);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/reportes', reportRoutes);

  app.get('/', (req, res) => {
    res.json({
      message: 'Bienvenido al Sistema de Agendamiento de Citas Médicas',
      institute: 'Instituto Superior Tecnológico Mayor Pedro Traversari',
      version: '1.0.0'
    });
  });

  app.get('/paciente', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'paciente.html'));
  });

  app.get('/medico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'medico.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  });
})();
