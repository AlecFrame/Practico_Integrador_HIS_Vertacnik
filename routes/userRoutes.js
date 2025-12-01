import express from 'express';
import { loginView, loginPost, logout, dashboard } from '../controllers/userController.js';
import { requireLogin, isLogged } from '../middleware/auth.js';

const router = express.Router();

router.get('/login', isLogged, loginView);
router.post('/login', loginPost);
router.post("/logout", logout);
router.get('/inicio', requireLogin, dashboard);

export default router;