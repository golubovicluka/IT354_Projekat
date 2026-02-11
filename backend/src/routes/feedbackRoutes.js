import express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/authMiddleware.js';
import { getDesignById, markDesignAsGraded } from '../models/designModel.js';
import { getFeedbackByDesignId, upsertFeedback } from '../models/feedbackModel.js';

const router = express.Router();

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseRating = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return null;
    }

    return parsed >= 1 && parsed <= 5 ? parsed : null;
};

router.post('/', verifyToken, verifyAdmin, (req, res) => {
    try {
        const designId = parsePositiveInt(req.body?.designId);
        const rating = parseRating(req.body?.rating);
        const commentsInput = req.body?.comments;

        if (!designId) {
            return res.status(400).json({ error: 'Invalid design id.' });
        }

        if (!rating) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
        }

        if (commentsInput !== undefined && commentsInput !== null && typeof commentsInput !== 'string') {
            return res.status(400).json({ error: 'Comments must be a string.' });
        }

        const comments = typeof commentsInput === 'string' ? commentsInput.trim() : '';

        const design = getDesignById(designId);
        if (!design) {
            return res.status(404).json({ error: 'Design not found.' });
        }

        if (design.status !== 'SUBMITTED' && design.status !== 'GRADED') {
            return res.status(409).json({ error: 'Only submitted or graded designs can receive feedback.' });
        }

        const feedback = upsertFeedback(designId, req.user.id, rating, comments);
        markDesignAsGraded(designId);

        return res.json({
            feedback,
            designStatus: 'GRADED',
        });
    } catch (error) {
        console.error('Upsert Feedback Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:designId', verifyToken, (req, res) => {
    try {
        const designId = parsePositiveInt(req.params.designId);
        if (!designId) {
            return res.status(400).json({ error: 'Invalid design id.' });
        }

        const design = getDesignById(designId);
        if (!design) {
            return res.status(404).json({ error: 'Design not found.' });
        }

        const isAdmin = req.user.role === 'ADMIN';
        if (!isAdmin && design.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const feedback = getFeedbackByDesignId(designId);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found for this design.' });
        }

        return res.json({
            ...feedback,
            design_status: design.status,
            scenario_id: design.scenario_id,
            design_user_id: design.user_id,
        });
    } catch (error) {
        console.error('Get Feedback Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
