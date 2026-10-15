import jwt from 'jsonwebtoken';
import User from "../models/User.js";


export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Token no proporcionado."
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Token inválido o expirado."
    });
  }

  try {
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        error: "Token sin identificador de usuario."
      });
    }

    const usuario = await User.findById(decoded.id)
      .select("_id role active");

    if (!usuario || usuario.active !== true) {
      return res.status(401).json({
        success: false,
        error: "Usuario inexistente o desactivado."
      });
    }

    req.usuario = {
      id: usuario._id.toString(),
      role: usuario.role
    };

    next();
  } catch (error) {
    console.error("Error de autenticación:", error);

    return res.status(500).json({
      success: false,
      error: "Error interno del servidor."
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