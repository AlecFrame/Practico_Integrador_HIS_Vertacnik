import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { validarEnfermeria, validarAdmisionId } from '../middleware/validations.js';
import { crear, darDeBaja, darDeAlta } from '../controllers/enfermeriaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('enfermeria'));

router.post('/crear', validarEnfermeria, validarAdmisionId, crear);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;