import { db } from '../database.js';

const getAllScenarios = () => {
    return db.prepare('SELECT * FROM scenarios ORDER BY created_at DESC').all();
};

const getScenarioById = (id) => {
    return db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
};

const createScenario = (title, description, difficulty, constraints) => {
    const result = db.prepare(
        'INSERT INTO scenarios (title, description, difficulty, constraints) VALUES (?, ?, ?, ?)'
    ).run(title, description, difficulty, constraints);
    return getScenarioById(result.lastInsertRowid);
};

const updateScenario = (id, title, description, difficulty, constraints) => {
    db.prepare(
        'UPDATE scenarios SET title = ?, description = ?, difficulty = ?, constraints = ? WHERE id = ?'
    ).run(title, description, difficulty, constraints, id);
    return getScenarioById(id);
};

const deleteScenario = (id) => {
    return db.prepare('DELETE FROM scenarios WHERE id = ?').run(id);
};

export { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario };
