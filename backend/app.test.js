import request from 'supertest';
import app from './app';
import * as userController from './controllers/user';
import * as projectController from './controllers/project';
import verifyToken from './middleware/authMiddleware';

jest.mock('./controllers/user');
jest.mock('./controllers/project');
jest.mock('./middleware/authMiddleware');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockImplementation((req, res, next) => next());
  });

  describe('User Routes', () => {
    it('should call login controller on POST /api/v1/login', async () => {
      // Given
      userController.login.mockImplementation((req, res) => res.status(200).send());

      // When
      await request(app).post('/api/v1/login').send({ username: 'test', password: 'test' });

      // Then
      expect(userController.login).toHaveBeenCalled();
    }, 10000);

    it('should call register controller on POST /api/v1/register', async () => {
      // Given
      userController.register.mockImplementation((req, res) => res.status(200).send());

      // When
      await request(app).post('/api/v1/register').send({ username: 'test', password: 'test' });

      // Then
      expect(userController.register).toHaveBeenCalled();
    }, 10000);
  });

  describe('Project Routes', () => {
    it('should call getProjectsForUser controller on GET /api/v1/projects', async () => {
      // Given
      projectController.getProjectsForUser.mockImplementation((req, res) => res.status(200).send());

      // When
      await request(app).get('/api/v1/projects');

      // Then
      expect(projectController.getProjectsForUser).toHaveBeenCalled();
    }, 10000);

    it('should call createProject controller on POST /api/v1/projects', async () => {
      // Given
      projectController.createProject.mockImplementation((req, res) => res.status(200).send());

      // When
      await request(app).post('/api/v1/projects').send({ name: 'New Project' });

      // Then
      expect(projectController.createProject).toHaveBeenCalled();
    }, 10000);
  });

  describe('404 Route', () => {
    it('should return 404 for unknown routes', async () => {
      // Given
      // No specific setup needed for this test

      // When
      const res = await request(app).get('/api/v1/unknown-route');

      // Then
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Page not found',
      });
    });
  });
});