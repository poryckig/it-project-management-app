import express from 'express';
import * as userController from '../controllers/user.js';
import verifyToken  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout', verifyToken, userController.logout);

router.get('/profile', verifyToken, userController.getUserProfile);


export default router;