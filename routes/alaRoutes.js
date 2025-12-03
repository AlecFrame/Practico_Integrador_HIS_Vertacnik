import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarAla } from '../middleware/validations.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/alaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin', 'enfermeria', 'medico'));

router.get('/', listar);

router.use(allowRoles('admin'));

router.post('/crear', validarAla, crear);
router.post('/editar/:id', validarAla, actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;