import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { filtrarAlas, filtrarHabitaciones } from '../controllers/camaController.js';
import {
    listar, crear, cambiarEstado, filtrarCamas, filtrarPacientes, detalles
} from '../controllers/admisionController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin'));

router.get('/', listar);
router.get('/detalle/:id', detalles);
router.post('/crear', crear);
router.post('/cambiarEstado/:id&:estado', cambiarEstado);

router.get('/api/alas/:idUnidad', filtrarAlas);
router.get("/api/habitaciones/:idAla", filtrarHabitaciones);
router.get("/api/camas/:idUnidad&:idAla&:idHabitacion&:idPaciente", filtrarCamas);
router.get("/api/pacientes", filtrarPacientes);

export default router;