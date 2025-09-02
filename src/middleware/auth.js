const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No hay token proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token no válido.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(401).json({ message: 'Token no válido.' });
  }
};

const isDoctor = (req, res, next) => {
  if (req.user.rol !== 'medico') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de médico.' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

const isPatient = (req, res, next) => {
  if (req.user.rol !== 'paciente') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de paciente.' });
  }
  next();
};

module.exports = { auth, isDoctor, isAdmin, isPatient };