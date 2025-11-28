import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/alaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin'));

router.get('/', listar);
router.post('/crear', crear);
router.post('/editar/:id', actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;