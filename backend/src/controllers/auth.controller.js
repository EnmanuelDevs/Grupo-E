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



export const obtenerUsuarios = async (req, res) => {

    try {
        const usuarios = await User
            .find()
            .select("-password");

        return res.status(200).json({
            success: true,
            data: usuarios,
            error: null
        });

    } catch (error) {
        console.log("Error al obtener ususarios", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: "Error del servidor al obtener los usuarios"
        });
    }
}

export const crearUsuarioAdmin = async (req, res) => {

    try {
        const {
            name,
            lastName,
            email,
            password,
            role,
        } = req.body;

        if (!name || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "Todos los campos son obligatorios"
            });
        }

        const usuarioExistente = await User.findOne({ email });

        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "El email ya está registrado"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            name,
            lastName,
            email,
            password,
            role
        });

        await nuevoUsuario.save();

        return res.status(201).json({
            success: true,
            data: {
                id: nuevoUsuario._id,
                name: nuevoUsuario.name,
                lastName: nuevoUsuario.lastName,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role,
                active: nuevoUsuario.active
            },
            error: null
        });

    } catch (error) {
        console.error("Error al crear usurio:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: "Error del servidor al crear usuario"
        });
    }
}


export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            lastName,
            email,
            role,
            active
        } = req.body;
        
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "Usuario no encontrado"
            });
        }

        if (name !== undefined) usuario.name = name;
        if (lastName !== undefined) usuario.lastName = lastName;
        if (email !== undefined) usuario.email = email;
        if (role !== undefined) usuario.role = role;
        if (active !== undefined) usuario.active = active;

        await usuario.save();

        return res.status(200).json({
            success: true,
            data: {
                id: usuario._id,
                name: usuario.name,
                lastName: usuario.lastName,
                email: usuario.email,
                role: usuario.role,
                active: usuario.active
            },
            error: null
        });
    
    } catch (error) {
        console.error("Error al actualizar usuario:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: "Error del servidor al actualizar usuario"
        });
    }
};


export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "Usuario no encontrado"
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            data: {
                id: usuario._id,
                message: "Usuario eliminado correctamente"
            },
            error: null
        });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);

        return res.status(500).json({
            success: false,
            data: null,
            error: "Error del servidor al eliminar usuario"
        });
    }
};