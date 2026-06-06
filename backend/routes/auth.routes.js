import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
const router = express.Router();

router.post('/login', loginLimiter, login);

export default router;
