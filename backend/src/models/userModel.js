import { db } from '../database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const createUser = (username, email, password, role = 'USER') => {
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    try {
        const stmt = db.prepare(`
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(username, email, hashedPassword, role);
        return { id: result.lastInsertRowid, username, email, role };
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Username or email already exists');
        }
        throw error;
    }
};

const findUserByEmail = (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
};

const findUserById = (id) => {
    const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
};

export {
    createUser,
    findUserByEmail,
    findUserById
};
