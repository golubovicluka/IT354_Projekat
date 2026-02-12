import express from 'express';
import { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario } from '../models/scenarioModel.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const ALLOWED_DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD']);

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const createValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const normalizeJsonField = (value, expectedType, fieldName) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    let parsedValue = value;

    if (typeof value === 'string') {
        try {
            parsedValue = JSON.parse(value);
        } catch {
            throw createValidationError(`${fieldName} must be valid JSON.`);
        }
    }

    if (expectedType === 'array' && !Array.isArray(parsedValue)) {
        throw createValidationError(`${fieldName} must be a JSON array.`);
    }

    if (
        expectedType === 'object' &&
        (typeof parsedValue !== 'object' || parsedValue === null || Array.isArray(parsedValue))
    ) {
        throw createValidationError(`${fieldName} must be a JSON object.`);
    }

    return JSON.stringify(parsedValue);
};

const buildScenarioPayload = (body) => {
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const difficulty = typeof body?.difficulty === 'string' ? body.difficulty.trim().toUpperCase() : '';

    if (!title || !description || !difficulty) {
        throw createValidationError('Missing required fields: title, description, difficulty.');
    }

    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
        throw createValidationError('Difficulty must be one of EASY, MEDIUM, HARD.');
    }

    const functionalRequirementsInput = body?.functionalRequirements ?? body?.functional_requirements;
    const nonFunctionalRequirementsInput = body?.nonFunctionalRequirements ?? body?.non_functional_requirements;
    const capacityEstimationsInput = body?.capacityEstimations ?? body?.capacity_estimations;

    return {
        title,
        description,
        difficulty,
        functionalRequirements: normalizeJsonField(
            functionalRequirementsInput,
            'array',
            'functionalRequirements'
        ),
        nonFunctionalRequirements: normalizeJsonField(
            nonFunctionalRequirementsInput,
            'array',
            'nonFunctionalRequirements'
        ),
        capacityEstimations: normalizeJsonField(
            capacityEstimationsInput,
            'object',
            'capacityEstimations'
        )
    };
};

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
        const payload = buildScenarioPayload(req.body);
        const newScenario = createScenario(payload);
        res.status(201).json(newScenario);
    } catch (error) {
        console.error('Create Scenario Error:', error);
        res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' });
    }
});

router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
    try {
        const payload = buildScenarioPayload(req.body);
        const updatedScenario = updateScenario(req.params.id, payload);
        if (!updatedScenario) {
            return res.status(404).json({ error: 'Scenario not found' });
        }
        res.json(updatedScenario);
    } catch (error) {
        console.error('Update Scenario Error:', error);
        res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' });
    }
});

router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
    try {
        const scenarioId = parsePositiveInt(req.params.id);
        if (!scenarioId) {
            return res.status(400).json({ error: 'Invalid scenario id.' });
        }

        const result = deleteScenario(scenarioId);
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
