import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { listar, crear, darDeBaja, darDeAlta } from '../controllers/altaHospitalariaController.js';

const router = express.Router();

router.use(requireLogin);

router.get('/', listar);

router.use(allowRoles('medico'));

router.post('/crear', crear);

router.use(allowRoles('admin'));

router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;