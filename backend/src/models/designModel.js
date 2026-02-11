import { db } from '../database.js';

const getDesignById = (id) => {
    return db.prepare('SELECT * FROM designs WHERE id = ?').get(id);
};

const getDraftByUserAndScenario = (userId, scenarioId) => {
    return db.prepare(
        `SELECT *
         FROM designs
         WHERE user_id = ? AND scenario_id = ? AND status = 'DRAFT'
         ORDER BY id DESC
         LIMIT 1`
    ).get(userId, scenarioId);
};

const getDesignsByUser = (userId, status = null) => {
    if (status) {
        return db.prepare(
            `SELECT d.*,
                    s.title AS scenario_title,
                    s.difficulty AS scenario_difficulty
             FROM designs d
             INNER JOIN scenarios s ON s.id = d.scenario_id
             WHERE d.user_id = ? AND d.status = ?
             ORDER BY d.id DESC`
        ).all(userId, status);
    }

    return db.prepare(
        `SELECT d.*,
                s.title AS scenario_title,
                s.difficulty AS scenario_difficulty
         FROM designs d
         INNER JOIN scenarios s ON s.id = d.scenario_id
         WHERE d.user_id = ?
         ORDER BY d.id DESC`
    ).all(userId);
};

const createDesign = (userId, scenarioId, diagramData, textExplanation = '') => {
    const result = db.prepare(
        `INSERT INTO designs (user_id, scenario_id, diagram_data, text_explanation)
         VALUES (?, ?, ?, ?)`
    ).run(userId, scenarioId, diagramData, textExplanation);

    return getDesignById(result.lastInsertRowid);
};

const updateDraftDesign = (id, userId, diagramData, textExplanation = '') => {
    const result = db.prepare(
        `UPDATE designs
         SET diagram_data = ?, text_explanation = ?
         WHERE id = ? AND user_id = ? AND status = 'DRAFT'`
    ).run(diagramData, textExplanation, id, userId);

    if (result.changes === 0) {
        return null;
    }

    return getDesignById(id);
};

const submitDraftDesign = (id, userId) => {
    const result = db.prepare(
        `UPDATE designs
         SET status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ? AND status = 'DRAFT'`
    ).run(id, userId);

    if (result.changes === 0) {
        return null;
    }

    return getDesignById(id);
};

const upsertDraftDesign = (userId, scenarioId, diagramData, textExplanation = '') => {
    const existingDraft = getDraftByUserAndScenario(userId, scenarioId);

    if (existingDraft) {
        const updated = updateDraftDesign(existingDraft.id, userId, diagramData, textExplanation);
        return { design: updated, created: false };
    }

    const created = createDesign(userId, scenarioId, diagramData, textExplanation);
    return { design: created, created: true };
};

export {
    getDesignById,
    getDesignsByUser,
    getDraftByUserAndScenario,
    createDesign,
    updateDraftDesign,
    submitDraftDesign,
    upsertDraftDesign,
};
