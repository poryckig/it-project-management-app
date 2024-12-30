import express from 'express';
import * as userController from '../controllers/user.js';
import * as projectController from '../controllers/project.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout', verifyToken, userController.logout);
router.get('/profile', verifyToken, userController.getUserProfile);

router.get('/projects', verifyToken, projectController.getProjectsForUser);
router.post('/projects', verifyToken, projectController.createProject);
router.get('/projects/:id', verifyToken, projectController.getProjectById);
router.put('/projects/:id', verifyToken, projectController.updateProject);
router.delete('/projects/:id', verifyToken, projectController.deleteProject);

router.get('/users/search', verifyToken, userController.searchUsers);
router.post('/projects/:id/invite', verifyToken, projectController.inviteUsers);

router.get('/invitations/:id', verifyToken, projectController.getInvitationById);
router.post('/invitations/:id/respond', verifyToken, projectController.respondToInvitation);

router.get('/notifications', verifyToken, userController.getNotifications);
router.delete('/notifications/:id', verifyToken, userController.deleteNotification);

router.get('/projects/:id/tasks', verifyToken, projectController.getTasksForProject);
router.post('/projects/:id/tasks', verifyToken, projectController.createTask);

router.get('/projects/:projectId/tasks/:taskId', verifyToken, projectController.getTaskById);
router.put('/projects/:projectId/tasks/:taskId', verifyToken, projectController.updateTask);
router.delete('/projects/:projectId/tasks/:taskId', verifyToken, projectController.deleteTask);

export default router;