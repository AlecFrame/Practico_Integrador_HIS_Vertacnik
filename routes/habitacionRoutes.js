import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarHabitacion, validarConsistenciaDeHabitaciones } from '../middleware/validations.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta
} from '../controllers/habitacionController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin', 'enfermeria', 'medico'));

router.get('/', listar);

router.use(allowRoles('admin'));

router.post('/crear', validarHabitacion, validarConsistenciaDeHabitaciones, crear);
router.post('/editar/:id', validarHabitacion, validarConsistenciaDeHabitaciones, actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);

export default router;