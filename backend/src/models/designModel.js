import { db } from '../database.js';

const getDesignById = (id) => {
    return db.prepare('SELECT * FROM designs WHERE id = ?').get(id);
};

const getDesignDetailsById = (id) => {
    return db.prepare(
        `SELECT d.*,
                u.username AS user_username,
                u.email AS user_email,
                s.title AS scenario_title,
                s.description AS scenario_description,
                s.functional_requirements AS scenario_functional_requirements,
                s.non_functional_requirements AS scenario_non_functional_requirements,
                s.capacity_estimations AS scenario_capacity_estimations,
                s.difficulty AS scenario_difficulty
         FROM designs d
         INNER JOIN users u ON u.id = d.user_id
         INNER JOIN scenarios s ON s.id = d.scenario_id
         WHERE d.id = ?`
    ).get(id);
};

const getDesignListSelect = `
    SELECT d.*,
           s.title AS scenario_title,
           s.difficulty AS scenario_difficulty,
           u.username AS user_username
    FROM designs d
    INNER JOIN scenarios s ON s.id = d.scenario_id
    INNER JOIN users u ON u.id = d.user_id
`;

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
            `${getDesignListSelect}
             WHERE d.user_id = ? AND d.status = ?
             ORDER BY d.id DESC`
        ).all(userId, status);
    }

    return db.prepare(
        `${getDesignListSelect}
         WHERE d.user_id = ?
         ORDER BY d.id DESC`
    ).all(userId);
};

const getDesignsForAdmin = (status = null) => {
    if (status) {
        return db.prepare(
            `${getDesignListSelect}
             WHERE d.status = ?
             ORDER BY d.id DESC`
        ).all(status);
    }

    return db.prepare(
        `${getDesignListSelect}
         ORDER BY d.id DESC`
    ).all();
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

const markDesignAsGraded = (id) => {
    db.prepare(
        `UPDATE designs
         SET status = 'GRADED'
         WHERE id = ?`
    ).run(id);

    return getDesignById(id);
};

const markDesignAsSubmitted = (id) => {
    db.prepare(
        `UPDATE designs
         SET status = 'SUBMITTED'
         WHERE id = ?`
    ).run(id);

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
    getDesignDetailsById,
    getDesignsByUser,
    getDesignsForAdmin,
    getDraftByUserAndScenario,
    createDesign,
    updateDraftDesign,
    submitDraftDesign,
    markDesignAsGraded,
    markDesignAsSubmitted,
    upsertDraftDesign,
};
