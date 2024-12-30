import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import verifyToken from './authMiddleware';

jest.mock('@prisma/client');
jest.mock('jsonwebtoken');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

PrismaClient.mockImplementation(() => mockPrisma);

describe('verifyToken Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should return 403 if no token is provided', async () => {
    // Given
    req.cookies.token = null;

    // When
    await verifyToken(req, res, next);

    // Then
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'A token is necessary for authentication' });
  });

  test('should return 401 if token is invalid', async () => {
    // Given
    req.cookies.token = 'invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // When
    await verifyToken(req, res, next);

    // Then
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  test('should return 401 if user is not found', async () => {
    // Given
    req.cookies.token = 'validtoken';
    jwt.verify.mockReturnValue({ id: 1 });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    // When
    await verifyToken(req, res, next);

    // Then
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
});