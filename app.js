const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
//const { initDatabase } = require('./src/config/initDatabase');

// Solo para desarrollo/test: inicializar BD
// if (process.env.NODE_ENV !== 'production') {
//   initDatabase();

// }

// Importar rutas
const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const userRoutes = require('./src/routes/users');
const reportRoutes = require('./src/routes/reports');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos desde la carpeta public

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/citas', appointmentRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/reportes', reportRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido al Sistema de Agendamiento de Citas Médicas',
    institute: 'Instituto Superior Tecnológico Mayor Pedro Traversari',
    version: '1.0.0'
  });
});

// Ruta para servir el HTML del paciente
app.get('/paciente', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paciente.html'));
});

// Ruta para servir el HTML del médico
app.get('/medico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'medico.html'));
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Instituto Superior Tecnológico Mayor Pedro Traversari`);
});
