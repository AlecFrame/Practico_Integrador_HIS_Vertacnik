import express from 'express';
import { loginView, loginPost, dashboard } from '../controllers/userController.js';

const router = express.Router();

router.get('/login', loginView);
router.post('/login', loginPost);
router.get('/dashboard', dashboard);

export default router;