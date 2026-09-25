import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUsuario = async (req, res) => {
    try {
        const { name, lastName, email, password, role } = req.body;

        if (!name || !lastName || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                error: 'Faltan campos obligatorios' 
            });
        }

        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ success: false, data: null, error: 'El email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            name,
            lastName,
            email,
            password: passwordEncriptada,
            role
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            success: true,
            data: { id: nuevoUsuario._id, name: nuevoUsuario.name, lastName: nuevoUsuario.lastName, email: nuevoUsuario.email, role: nuevoUsuario.role },
            error: null
        });

    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).json({ success: false, data: null, error: 'Error del servidor al registrar usuario' });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, data: null, error: 'Proporciona email y contraseña' });
        }

        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ success: false, data: null, error: 'Credenciales incorrectas' });
        }

        const esPasswordValido = await bcrypt.compare(password, usuario.password);
        if (!esPasswordValido) {
            return res.status(401).json({ success: false, data: null, error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            data: { token, usuario: { id: usuario._id, name: usuario.name, lastName: usuario.lastName, email: usuario.email, role: usuario.role } },
            error: null
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, data: null, error: 'Error del servidor' });
    }
};


export const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await User.findById(req.usuario.id).select('-password');

        if (!usuario) {
            return res.status(404).json({ success: false, data: null, error: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            success: true,
            data: usuario,
            error: null
        });

    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return res.status(500).json({ success: false, data: null, error: 'Error del servidor al obtener el perfil' });
    }
};