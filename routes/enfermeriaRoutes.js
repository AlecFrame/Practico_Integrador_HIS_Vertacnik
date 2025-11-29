import express from 'express';
import { requireLogin, isLogged } from '../middleware/auth.js';
import { crear, darDeBaja, darDeAlta } from '../controllers/enfermeriaController.js';

const router = express.Router();

router.use(requireLogin);

router.post('/crear', crear);
router.post('/baja/:id', darDeBaja);
router.post('/alta/:id', darDeAlta);


export default router;