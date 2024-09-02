import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateUsername, validatePassword } from '../middleware/validation.js';

const prisma = new PrismaClient();
const PEPPER = process.env.PEPPER;
const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
    const { username, password } = req.body;

    // Walidacja nazwy użytkownika
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
  
      if (!user) {
        return res.status(401).json({ message: 'Wrong username or password' });
      }
  
      // Walidacja hasła
      const isPasswordCorrect = await bcrypt.compare(password + PEPPER, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Wrong username or password' });
      }
  
      // Generowanie tokena JWT
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '4h' });
  
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
};  
  
async function register(req, res) {
    const { username, password } = req.body;

    // Walidacja hasła
    if (!validatePassword(password)) {
        return res.status(400).json({
            message: 'Your password should have 8-128 characters, with at least one lowercase letter, uppercase letter, number and special sign'
        });
    }

    // Walidacja nazwy użytkownika
    if (!validateUsername(username)) {
        return res.status(400).json({
            message: 'Your username should have 3-20 alphanumeric characters'
        });
    }

    try {
        // Sprawdzenie, czy nazwa użytkownika jest już zajęta
        const isUsernameTaken = await prisma.user.findUnique({
            where: { username }
        });

        if (isUsernameTaken) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        // Hashowanie hasła z użyciem PEPPER i SALT
        const hashedPassword = await bcrypt.hash(password + PEPPER, 12);

        // Tworzenie nowego użytkownika
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                registeredAt: new Date() // Ustawienie daty rejestracji użytkownika
            }
        });

        res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};

async function getUserProfile(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                registeredAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

async function searchUsers(req, res) {
    const { query } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                username: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

async function getNotifications(req, res) {
    const { id: userId } = req.user;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function deleteNotification(req, res) {
    const { id } = req.params;
  
    try {
      await prisma.notification.delete({
        where: { id: parseInt(id) },
      });
  
      res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

export { login, register, logout, getUserProfile, searchUsers, getNotifications, deleteNotification };