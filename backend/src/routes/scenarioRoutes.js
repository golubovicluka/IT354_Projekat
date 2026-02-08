import express from 'express';
import { getAllScenarios, getScenarioById } from '../models/scenarioModel.js';
import { verifyToken } from '../middleware/authMiddleware.js';

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

export default router;
