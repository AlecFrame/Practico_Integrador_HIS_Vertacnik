import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarCama, validarConsistenciaDeCamas } from '../middleware/validations.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta, filtrarAlas, filtrarHabitaciones, cambiarEstado
} from '../controllers/camaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin', 'enfermeria', 'medico'));

router.get('/', listar);
router.get('/api/alas/:idUnidad', filtrarAlas);
router.get("/api/habitaciones/:idAla", filtrarHabitaciones);

router.use(allowRoles('admin', 'enfermeria'));

router.post('/cambiarEstado/:id&:estado', cambiarEstado);

router.use(allowRoles('admin'));

router.post('/crear', validarCama, validarConsistenciaDeCamas, crear);
router.post('/editar/:id', validarCama, validarConsistenciaDeCamas, actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;