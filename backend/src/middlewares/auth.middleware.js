import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            data: null,
            error: 'Acceso denegado: Token no proporcionado o formato incorrecto'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            data: null,
            error: 'Sesión expirada o token inválido. Por favor, inicie sesión nuevamente.'
        });
    }
};

export const verificarAdmin = (req, res, next) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({
            success: false,
            data: null,
            error: 'Acceso denegado: Área exclusiva para administradores'
        });
    }
    next();
};