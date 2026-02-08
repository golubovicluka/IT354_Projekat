import express from 'express';
import { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario } from '../models/scenarioModel.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
    try {
        const scenarios = getAllScenarios();
        res.json(scenarios);
    } catch (error) {
        console.error('Get Scenarios Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', verifyToken, (req, res) => {
    try {
        const scenario = getScenarioById(req.params.id);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        res.json(scenario);
    } catch (error) {
        console.error('Get Scenario Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', verifyToken, verifyAdmin, (req, res) => {
    try {
        const { title, description, difficulty, constraints } = req.body;
        if (!title || !description || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newScenario = createScenario(title, description, difficulty, constraints);
        res.status(201).json(newScenario);
    } catch (error) {
        console.error('Create Scenario Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
    try {
        const { title, description, difficulty, constraints } = req.body;
        const updatedScenario = updateScenario(req.params.id, title, description, difficulty, constraints);
        if (!updatedScenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        res.json(updatedScenario);
    } catch (error) {
        console.error('Update Scenario Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
    try {
        const result = deleteScenario(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        res.json({ message: 'Scenario deleted successfully' });
    } catch (error) {
        console.error('Delete Scenario Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
