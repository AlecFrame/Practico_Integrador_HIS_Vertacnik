import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { filtrarAlas, filtrarHabitaciones } from '../controllers/camaController.js';
import { validarAdmision, validarConsistenciaDeAdmisiones } from '../middleware/validations.js'
import {
    listar, crear, crearNoIdentificado, cambiarEstado, filtrarCamas, filtrarPacientes, detalles
} from '../controllers/admisionController.js';

const router = express.Router();

router.use(requireLogin);

router.get('/', listar);
router.get('/detalle/:id', detalles);
router.get('/api/alas/:idUnidad', filtrarAlas);
router.get("/api/habitaciones/:idAla", filtrarHabitaciones);
router.get("/api/camas/:idUnidad&:idAla&:idHabitacion&:idPaciente&:pacienteNN", filtrarCamas);
router.get("/api/pacientes", filtrarPacientes);

router.use(allowRoles('admin', 'recepcion'));

router.post('/crear', validarAdmision, validarConsistenciaDeAdmisiones, crear);
router.post('/crearNN', validarAdmision, validarConsistenciaDeAdmisiones, crearNoIdentificado);
router.post('/cambiarEstado/:id&:estado', cambiarEstado);

export default router;