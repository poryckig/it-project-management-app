import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  // Sprawdź, czy istnieje nagłówek Authorization, zanim użyjesz replace
  const authHeader = req.header('Authorization');
  const token = req.cookies.token || (authHeader && authHeader.replace('Bearer ', ''));

  if (!token) {
      return res.status(403).json({ message: 'No token provided' });
  }

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.users.findUnique({ where: { id: decoded.id } });

      if (!user) {
          return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
  } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
  }
};

export default verifyToken;