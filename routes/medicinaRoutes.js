import express from 'express';
import { requireLogin, allowRoles } from '../middleware/auth.js';
import { crear, darDeBaja, darDeAlta } from '../controllers/medicinaController.js';

const router = express.Router();

router.use(requireLogin);
router.use(allowRoles('medico'));

router.post('/crear', crear);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;