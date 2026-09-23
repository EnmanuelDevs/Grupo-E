import Usuario from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, data: null, error: 'Proporciona nombre, email y contraseña' });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ success: false, data: null, error: 'El email ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: passwordEncriptada,
            rol: rol || 'miembro'
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            success: true,
            data: { id: nuevoUsuario._id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email },
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

        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ success: false, data: null, error: 'Credenciales incorrectas' });
        }

        const esPasswordValido = await bcrypt.compare(password, usuario.password);
        if (!esPasswordValido) {
            return res.status(401).json({ success: false, data: null, error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            data: { token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } },
            error: null
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, data: null, error: 'Error del servidor' });
    }
};