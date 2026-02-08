import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/userModel.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

router.post('/register', (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const userRole = role === 'ADMIN' ? 'USER' : (role || 'USER');

        const user = createUser(username, email, password, userRole);
        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        if (error.message === 'Username or email already exists') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
