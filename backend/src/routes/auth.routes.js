import express from 'express';
import { loginUsuario, registerUsuario, obtenerPerfil, obtenerUsuarios, 
    crearUsuarioAdmin, actualizarUsuario, eliminarUsuario
} from '../controllers/auth.controller.js';

import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUsuario);
router.post('/login', loginUsuario);
router.post('/users', verificarToken, verificarAdmin, crearUsuarioAdmin);

router.put('/users/:id', verificarToken, verificarAdmin, actualizarUsuario);

router.delete('/users/:id', verificarToken, verificarAdmin, eliminarUsuario);

router.get('/me', verificarToken, obtenerPerfil);
router.get('/users',verificarToken, verificarAdmin, obtenerUsuarios);

router.get('/admin-dashboard', verificarToken, verificarAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        data: { 
            mensaje: "Bienvenido al panel de administrador.", 
            datosAdmin: req.usuario 
        },
        error: null
    });
});

export default router;