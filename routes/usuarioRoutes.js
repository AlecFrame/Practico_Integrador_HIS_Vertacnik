import express from 'express';
import { requireLogin, allowRoles, requireSelfOrAdmin } from '../middleware/auth.js';
import { uploadAvatar } from "../config/multer.js";
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/usuarioController.js';

const router = express.Router();

router.use(requireLogin);
router.post('/editar/:id', requireSelfOrAdmin, uploadAvatar.single("avatar"), actualizar);

router.use(allowRoles('admin'));

router.get('/', listar);
router.post('/crear', uploadAvatar.single("avatar"), crear);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;