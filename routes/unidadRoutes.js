import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarUnidad } from '../middleware/validations.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/unidadController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin', 'enfermeria', 'medico'));

router.get('/', listar);

router.use(allowRoles('admin'));

router.post('/crear', validarUnidad, crear);
router.post('/editar/:id', validarUnidad, actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;