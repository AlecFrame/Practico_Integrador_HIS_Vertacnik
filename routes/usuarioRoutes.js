import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { uploadAvatar } from "../config/multer.js";
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/usuarioController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin'));

router.get('/', listar);
router.post('/crear', uploadAvatar.single("avatar"), crear);
router.post('/editar/:id', uploadAvatar.single("avatar"), actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;