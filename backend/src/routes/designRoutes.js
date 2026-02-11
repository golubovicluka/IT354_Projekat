import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getScenarioById } from '../models/scenarioModel.js';
import {
    getDesignById,
    getDesignDetailsById,
    getDesignsForAdmin,
    getDesignsByUser,
    getDraftByUserAndScenario,
    submitDraftDesign,
    updateDraftDesign,
    upsertDraftDesign,
} from '../models/designModel.js';

const router = express.Router();
const ALLOWED_DESIGN_STATUSES = new Set(['DRAFT', 'SUBMITTED', 'GRADED']);

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isValidDiagramData = (diagramData) => {
    if (typeof diagramData !== 'string') {
        return false;
    }

    try {
        const parsed = JSON.parse(diagramData);
        return Array.isArray(parsed);
    } catch {
        return false;
    }
};

router.get('/', verifyToken, (req, res) => {
    try {
        const rawStatus = typeof req.query?.status === 'string'
            ? req.query.status.trim().toUpperCase()
            : '';
        const status = rawStatus || null;

        if (status && !ALLOWED_DESIGN_STATUSES.has(status)) {
            return res.status(400).json({ error: 'Invalid status. Allowed values: DRAFT, SUBMITTED, GRADED.' });
        }

        const designs = req.user.role === 'ADMIN'
            ? getDesignsForAdmin(status)
            : getDesignsByUser(req.user.id, status);
        return res.json(designs);
    } catch (error) {
        console.error('Get Designs Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', verifyToken, (req, res) => {
    try {
        const designId = parsePositiveInt(req.params.id);
        if (!designId) {
            return res.status(400).json({ error: 'Invalid design id.' });
        }

        const design = getDesignDetailsById(designId);
        if (!design) {
            return res.status(404).json({ error: 'Design not found.' });
        }

        const isAdmin = req.user.role === 'ADMIN';
        if (!isAdmin && design.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        return res.json(design);
    } catch (error) {
        console.error('Get Design Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/scenario/:scenarioId/draft', verifyToken, (req, res) => {
    try {
        const scenarioId = parsePositiveInt(req.params.scenarioId);
        if (!scenarioId) {
            return res.status(400).json({ error: 'Invalid scenario id.' });
        }

        const scenario = getScenarioById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found.' });
        }

        const draft = getDraftByUserAndScenario(req.user.id, scenarioId);
        res.json(draft || null);
    } catch (error) {
        console.error('Get Draft Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', verifyToken, (req, res) => {
    try {
        const scenarioId = parsePositiveInt(req.body?.scenarioId);
        const { diagramData } = req.body ?? {};
        const textExplanation = typeof req.body?.textExplanation === 'string'
            ? req.body.textExplanation
            : '';

        if (!scenarioId) {
            return res.status(400).json({ error: 'Invalid scenario id.' });
        }

        if (!isValidDiagramData(diagramData)) {
            return res.status(400).json({ error: 'diagramData must be a JSON stringified elements array.' });
        }

        const scenario = getScenarioById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ error: 'Scenario not found.' });
        }

        const { design, created } = upsertDraftDesign(
            req.user.id,
            scenarioId,
            diagramData,
            textExplanation
        );

        return res.status(created ? 201 : 200).json(design);
    } catch (error) {
        console.error('Create/Upsert Design Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', verifyToken, (req, res) => {
    try {
        const designId = parsePositiveInt(req.params.id);
        const { diagramData } = req.body ?? {};
        const textExplanation = typeof req.body?.textExplanation === 'string'
            ? req.body.textExplanation
            : '';

        if (!designId) {
            return res.status(400).json({ error: 'Invalid design id.' });
        }

        if (!isValidDiagramData(diagramData)) {
            return res.status(400).json({ error: 'diagramData must be a JSON stringified elements array.' });
        }

        const design = getDesignById(designId);
        if (!design) {
            return res.status(404).json({ error: 'Design not found.' });
        }

        if (design.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (design.status !== 'DRAFT') {
            return res.status(409).json({ error: 'Only draft designs can be updated.' });
        }

        const updated = updateDraftDesign(designId, req.user.id, diagramData, textExplanation);
        return res.json(updated);
    } catch (error) {
        console.error('Update Design Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:id/submit', verifyToken, (req, res) => {
    try {
        const designId = parsePositiveInt(req.params.id);
        if (!designId) {
            return res.status(400).json({ error: 'Invalid design id.' });
        }

        const design = getDesignById(designId);
        if (!design) {
            return res.status(404).json({ error: 'Design not found.' });
        }

        if (design.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (design.status !== 'DRAFT') {
            return res.status(409).json({ error: 'Only draft designs can be submitted.' });
        }

        const submitted = submitDraftDesign(designId, req.user.id);
        return res.json(submitted);
    } catch (error) {
        console.error('Submit Design Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
