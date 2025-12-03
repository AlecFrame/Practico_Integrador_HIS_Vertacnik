import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarPaciente, validarDniUnico, validarDniUnicoEditar, validarRelacionPaciente } from '../middleware/validations.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta, relacionar
} from '../controllers/pacienteController.js';

const router = express.Router();

router.use(requireLogin);

router.get('/', listar);
router.post('/relacionar', validarRelacionPaciente, allowRoles('medico'), relacionar);
router.post('/crear', validarPaciente, validarDniUnico, allowRoles('admin', 'recepcion', 'medico'), crear);

router.use(allowRoles('admin', 'recepcion'));

router.post('/editar/:id', validarPaciente, validarDniUnicoEditar, actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;