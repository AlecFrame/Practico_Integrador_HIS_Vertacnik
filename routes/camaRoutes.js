import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import {
    listar, crear, actualizar, darDeBaja, darDeAlta, filtrarAlas, filtrarHabitaciones
} from '../controllers/camaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('admin'));

router.get('/', listar);
router.post('/crear', crear);
router.post('/editar/:id', actualizar);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);

router.get('/api/alas/:idUnidad', filtrarAlas);
router.get("/api/habitaciones/:idAla", filtrarHabitaciones);

export default router;