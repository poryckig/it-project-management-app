import request from 'supertest';
import app from '../app';

jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should return 400 for invalid password', async () => {
      // Given
      const invalidPassword = 'short';
      const username = 'newuser';

      // When
      const res = await request(app)
        .post('/api/v1/register')
        .send({ username, password: invalidPassword });

      // Then
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Your password should have 8-128 characters, with at least one lowercase letter, uppercase letter, number and special sign',
      });
    });

    it('should return 400 for invalid username', async () => {
      // Given
      const invalidUsername = 'nu';
      const password = 'Password123!';

      // When
      const res = await request(app)
        .post('/api/v1/register')
        .send({ username: invalidUsername, password });

      // Then
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Your username should have 3-20 alphanumeric characters',
      });
    });
  });
});