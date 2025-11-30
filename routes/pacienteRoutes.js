import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import {
    listarPacientes, crearPaciente, actualizarPaciente, darDeBajaPaciente, darDeAltaPaciente
} from '../controllers/pacienteController.js';

const router = express.Router();

router.use(requireLogin);

router.get('/', listarPacientes);

router.use(allowRoles('admin', 'recepcion'));

router.post('/crear', crearPaciente);
router.post('/editar/:id', actualizarPaciente);
router.post('/baja/:id', darDeBajaPaciente);
router.post('/alta/:id', darDeAltaPaciente);


export default router;