import express from 'express';
import * as userController from '../controllers/user.js';
import * as projectController from '../controllers/project.js';
import verifyToken  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout', verifyToken, userController.logout);
router.get('/profile', verifyToken, userController.getUserProfile);

router.get('/projects', verifyToken, projectController.getProjectsForUser);
router.post('/projects', verifyToken, projectController.createProject);
router.get('/projects/:id', verifyToken, projectController.getProjectById);
router.put('/projects/:id', verifyToken, projectController.updateProject);

export default router;