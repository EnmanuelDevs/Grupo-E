export const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {

        if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({
                success: false,
                error: "Acceso denegado: No tienes permisos para acceder a esta sección"
            });
        }
        next();
    };
};