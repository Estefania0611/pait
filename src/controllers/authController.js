const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Validar campos
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
    }
    
    const user = await User.findByEmail(correo);
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }
    
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        rol: user.rol,
        telefono: user.telefono,
        cedula: user.cedula
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const register = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      correo,
      password,
      telefono,
      cedula,
      rol = 'paciente'
    } = req.body;
    
    // Validar campos requeridos
    if (!nombres || !apellidos || !correo || !password || !cedula) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(correo);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }
    
    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Crear usuario
    const newUser = await User.create({
      nombres,
      apellidos,
      correo,
      password: hashedPassword,
      telefono,
      cedula,
      rol
    });
    
    // Generar token
    const token = jwt.sign(
      { id: newUser.id, rol: newUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        correo: newUser.correo,
        rol: newUser.rol,
        telefono: newUser.telefono,
        cedula: newUser.cedula
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const getProfile = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware de autenticación
    const user = req.user;
    
    res.json({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      rol: user.rol,
      telefono: user.telefono,
      cedula: user.cedula
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = {
  login,
  register,
  getProfile
};