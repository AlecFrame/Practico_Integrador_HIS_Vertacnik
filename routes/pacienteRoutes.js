import express from 'express';
import {
    listarPacientes,
    mostrarFormularioCrear,
    crearPaciente,
    mostrarFormularioEditar,
    actualizarPaciente
} from '../controllers/pacienteController.js';

const router = express.Router();

router.get('/', listarPacientes);
router.get('/crear', mostrarFormularioCrear);
router.post('/crear', crearPaciente);
router.get('/editar/:id', mostrarFormularioEditar);
router.post('/editar/:id', actualizarPaciente);

export default router;